const path = require('path');
const fs = require('fs');

/** Pick env file: OATS_ENV_FILE, or ma3.env (visible name), or .env (dotfile convention). */
function resolveEnvFilePath() {
    if (process.env.OATS_ENV_FILE) {
        return path.isAbsolute(process.env.OATS_ENV_FILE)
            ? process.env.OATS_ENV_FILE
            : path.join(__dirname, process.env.OATS_ENV_FILE);
    }
    const named = path.join(__dirname, 'ma3.env');
    const hidden = path.join(__dirname, '.env');
    if (fs.existsSync(named)) return named;
    if (fs.existsSync(hidden)) return hidden;
    return hidden;
}

const envFilePath = resolveEnvFilePath();
require('dotenv').config({ path: envFilePath, override: true });

const express = require('express');
const https = require('https');
const osc = require('osc');
const os = require('os');
const multer = require('multer');
const WebSocket = require('ws');
const { loadSttFixes, applySttFixes } = require('./lib/stt-fixes');
const { applySpokenNumerals } = require('./lib/spoken-numerals');
const { shieldOatsPhrases, unshieldOatsPhrases } = require('./lib/oats-voice-guards');
const {
    getVoiceSttBackend,
    getMicMode,
    getDeepgramLiveWsUrl,
    getGoogleSttEnvIssues,
    transcribeWithDeepgram,
    transcribeWithOpenAI,
    transcribeWithGoogleCloud,
} = require('./lib/transcribe-providers');
const { getLlmConfig, interpretLighting } = require('./lib/llm-interpret');
const app = express();

// CONFIG: Your Windows PC IP running grandMA3 onPC
const MA3_IP = "192.168.1.50";  // <-- update to your Windows PC IP
const MA3_PORT = 8000;

const sttFixes = loadSttFixes(__dirname);

let ma3Terminology = { meta: {}, entries: [] };
try {
    ma3Terminology = JSON.parse(
        fs.readFileSync(path.join(__dirname, 'data', 'ma3-terminology.json'), 'utf8')
    );
} catch (e) {
    console.warn('[terminology] Could not load ma3-terminology.json:', e.message);
}

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 15 * 1024 * 1024 },
});

// Auto-detect WiFi IP (en1 on Mac Mini), skip ghost 169.254 addresses
function getWifiIP() {
    const ifaces = os.networkInterfaces();
    for (const name of ['en1', 'en0', 'en2']) {
        const iface = ifaces[name];
        if (iface) {
            const addr = iface.find(i => i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254'));
            if (addr) return { ip: addr.address, iface: name };
        }
    }
    for (const [name, addrs] of Object.entries(ifaces)) {
        const addr = addrs.find(i => i.family === 'IPv4' && !i.internal && !i.address.startsWith('169.254'));
        if (addr) return { ip: addr.address, iface: name };
    }
    return { ip: '0.0.0.0', iface: 'unknown' };
}

/** Natural language → grandMA3-style command string (OATS layer). */
function oatsTranslate(rawVoice) {
    // Longer phrases before shorter ones where order matters.
    return rawVoice
        .replace(/\bthrough\b/gi, "Thru")

        // Selection words
        .replace(/\bgrab\b/gi, "Fixture")
        .replace(/\bselect\b/gi, "Fixture")
        .replace(/\ball fixtures\b/gi, "Fixture 1 Thru")
        .replace(/\bgroup\b/gi, "Group")
        .replace(/\bgroups\b/gi, "Group")

        // Value words
        .replace(/\bat full\b/gi, "At 100")
        .replace(/\bfull\b/gi, "At 100")
        .replace(/\bat half\b/gi, "At 50")
        .replace(/\bhalf\b/gi, "At 50")
        .replace(/\bat zero\b/gi, "At 0")
        .replace(/\bout\b/gi, "At 0")
        .replace(/\bblind\b/gi, "At 0")
        .replace(/\bmake them\b/gi, "At")
        .replace(/\bput them\b/gi, "At")
        .replace(/\bset to\b/gi, "At")
        .replace(/\bgive me\b/gi, "At")
        .replace(/\bpercent\b/gi, "")
        .replace(/%/g, "")

        // Action words
        .replace(/\bkill\b/gi, "Off")
        .replace(/\bdump\b/gi, "ClearAll")
        .replace(/\bclear all\b/gi, "ClearAll")
        .replace(/\bclear me out\b/gi, "ClearAll")
        .replace(/\bclear\b/gi, "ClearAll")
        .replace(/\bhome\b/gi, "At 0")
        .replace(/\breset\b/gi, "At 0")
        .replace(/\bblackout\b/gi, "At 0")

        // Store / record words
        .replace(/\brecord\b/gi, "Store")
        .replace(/\bsave\b/gi, "Store")
        .replace(/\bstore\b/gi, "Store")
        .replace(/\bupdate\b/gi, "Update")
        .replace(/\bdelete\b/gi, "Delete")
        .replace(/\bremove\b/gi, "Delete")

        // Playback words
        .replace(/\bgo to cue\b/gi, "Go Cue")
        .replace(/\bjump to cue\b/gi, "Go Cue")
        .replace(/\bgo\b/gi, "Go")
        .replace(/\bback\b/gi, "GoBack")
        .replace(/\bpause\b/gi, "Pause")
        .replace(/\bstop\b/gi, "Pause")

        // Preset types
        .replace(/\bcolor preset\b/gi, "Preset \"Color\"")
        .replace(/\bposition preset\b/gi, "Preset \"Position\"")
        .replace(/\bgobo preset\b/gi, "Preset \"Beam\"")
        .replace(/\bbeam preset\b/gi, "Preset \"Beam\"")
        .replace(/\bdimmer preset\b/gi, "Preset \"Dimmer\"")

        // Attribute words
        .replace(/\bdimmer\b/gi, "Attribute \"Dimmer\"")
        .replace(/\bintensity\b/gi, "Attribute \"Dimmer\"")
        .replace(/\btilt\b/gi, "Attribute \"Tilt\"")
        .replace(/\bpan\b/gi, "Attribute \"Pan\"")
        .replace(/\biris\b/gi, "Attribute \"Iris\"")
        .replace(/\bfocus\b/gi, "Attribute \"Focus\"")
        .replace(/\bzoom\b/gi, "Attribute \"Zoom\"")
        .replace(/\bfrost\b/gi, "Attribute \"Frost\"")
        .replace(/\bstrobe\b/gi, "Attribute \"Shutter\"")
        .replace(/\bshutter\b/gi, "Attribute \"Shutter\"")

        // Cleanup
        .replace(/\s{2,}/g, " ")
        .trim();
}

app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

// OSC bridge to grandMA3
const udpPort = new osc.UDPPort({
    localAddress: "0.0.0.0",
    localPort: 0,
    remoteAddress: MA3_IP,
    remotePort: MA3_PORT,
});

udpPort.on("error", (err) => {
    console.error("OSC Error:", err.message);
});

udpPort.open();

app.get('/api/config', (req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    const mic = getMicMode();
    const llm = getLlmConfig();
    const deepgramLive =
        String(process.env.DEEPGRAM_LIVE || '').trim() === '1' &&
        mic.mode === 'cloud' &&
        mic.cloud === 'deepgram';
    const voiceMode = String(process.env.VOICE_MODE || 'tap').toLowerCase().trim();
    res.json({
        /** @deprecated use micMode + voiceCloudProvider */
        voiceProvider: mic.cloud || (mic.mode === 'browser' ? 'browser' : null),
        voiceCloudProvider: mic.cloud,
        micMode: mic.mode,
        webSpeechLang: process.env.WEB_SPEECH_LANG || 'en-US',
        deepgramLive,
        voiceMode: voiceMode === 'ptt' ? 'ptt' : 'tap',
        listenTimeoutMs: Number(process.env.LISTEN_TIMEOUT_MS || 6500),
        voiceHold: mic.mode !== 'none',
        aiEnabled: Boolean(llm),
        aiProvider: llm ? llm.provider : null,
        aiModel: llm ? llm.model : null,
        sttFixCount: sttFixes.length,
        terminologyCount: Array.isArray(ma3Terminology.entries) ? ma3Terminology.entries.length : 0,
    });
});

app.post('/ai/interpret', async (req, res) => {
    const text = req.body && typeof req.body.text === 'string' ? req.body.text.trim() : '';
    if (!text) return res.status(400).json({ error: 'Missing JSON body: { "text": "..." }' });
    if (!getLlmConfig()) {
        return res.status(503).json({
            error: 'No LLM key set. Add GEMINI_API_KEY to .env (Gemini is default). Optional: OPENAI_API_KEY or ANTHROPIC_API_KEY, or LLM_PROVIDER=google|openai|anthropic.',
        });
    }
    try {
        const out = await interpretLighting(text);
        res.json(out);
    } catch (err) {
        console.error('[ai/interpret]', err);
        res.status(502).json({ error: err.message || 'LLM request failed' });
    }
});

app.get('/api/terminology', (req, res) => {
    res.json(ma3Terminology);
});

app.post('/transcribe', upload.single('audio'), async (req, res) => {
    if (!req.file || !req.file.buffer) {
        return res.status(400).json({ error: 'Missing audio file (multipart field name: audio)' });
    }

    const backend = getVoiceSttBackend();
    if (!backend) {
        return res.status(503).json({
            error:
                'Server-side STT is off. Add DEEPGRAM_API_KEY (free tier) for cloud transcription, ' +
                'or use on-device speech: open this page with no cloud keys (mic uses Safari Web Speech, no billing). ' +
                'Optional: STT_PROVIDER=browser forces on-device only.',
        });
    }

    try {
        let text = '';
        if (backend === 'openai') {
            text = await transcribeWithOpenAI(req.file.buffer, req.file.mimetype);
        } else if (backend === 'google_cloud') {
            text = await transcribeWithGoogleCloud(req.file.buffer, req.file.mimetype);
        } else if (backend === 'deepgram') {
            text = await transcribeWithDeepgram(req.file.buffer, req.file.mimetype);
        } else {
            return res.status(501).json({ error: `Unknown STT backend: ${backend}` });
        }
        const audioInfo = { bytes: req.file.buffer.length, mime: req.file.mimetype || 'unknown' };
        if (!String(text || '').trim()) {
            // Helpful diagnostic instead of silently returning empty text.
            return res.status(422).json({
                error: 'No speech detected by STT provider. Try holding the button longer and speaking closer to the mic.',
                provider: backend,
                audio: audioInfo,
            });
        }
        res.json({ text, provider: backend, audio: audioInfo });
    } catch (err) {
        console.error('[transcribe]', err);
        res.status(502).json({ error: err.message || 'Transcription failed' });
    }
});

app.post('/command', (req, res) => {
    const rawVoice = req.body.text;
    if (!rawVoice) return res.status(400).json({ error: "No text provided" });

    const preformatted = Boolean(req.body.preformatted);
    const afterStt = preformatted ? String(rawVoice).trim() : applySttFixes(rawVoice, sttFixes);
    const afterNums = preformatted ? afterStt : applySpokenNumerals(afterStt);
    let syntax;
    if (preformatted) {
        syntax = afterNums;
    } else {
        const shielded = shieldOatsPhrases(afterNums);
        syntax = oatsTranslate(shielded.text);
        syntax = unshieldOatsPhrases(syntax, shielded.slots);
    }

    udpPort.send({
        address: "/cmd",
        args: [{ type: "s", value: syntax }]
    });

    console.log(
        preformatted
            ? `[CMD] LLM/direct → "${syntax}"`
            : `[OATS] "${rawVoice}" | stt → "${afterStt}" | nums → "${afterNums}" | ma3 → "${syntax}"`
    );
    res.json({ status: "sent", command: syntax, stt: afterNums, sttRaw: afterStt, raw: rawVoice, preformatted });
});

// HTTPS server using self-signed cert
const sslOptions = {
    key:  fs.readFileSync(path.join(__dirname, 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.pem')),
};

const PORT = Number(process.env.PORT) || 3000;
const server = https.createServer(sslOptions, app);

/**
 * Live Deepgram WS relay.
 * Client sends raw linear16 PCM frames at 16kHz mono (Int16 LE) over /live as binary.
 * Server forwards to Deepgram WS and streams transcripts back as JSON messages:
 * { type: "interim"|"final", text: "...", raw: <deepgram message> }
 *
 * NOTE: We handle upgrades manually so `/live`, `/live/`, and `/live?x=y` all work.
 */
const liveWss = new WebSocket.Server({ noServer: true });
server.on('upgrade', (req, socket, head) => {
    const url = String(req.url || '');
    if (!url.startsWith('/live')) return;
    try {
        console.log(`[live] upgrade from ${req.socket.remoteAddress} (${url})`);
    } catch (_) {}
    try {
        liveWss.handleUpgrade(req, socket, head, (ws) => {
            liveWss.emit('connection', ws, req);
        });
    } catch (e) {
        try {
            console.error('[live] handleUpgrade failed:', e.message || e);
        } catch (_) {}
        try {
            socket.write('HTTP/1.1 400 Bad Request\r\n\r\n');
        } catch (_) {}
        try {
            socket.destroy();
        } catch (_) {}
    }
});

liveWss.on('connection', (client) => {
    try {
        console.log('[live] client connected');
    } catch (_) {}
    const apiKey = process.env.DEEPGRAM_API_KEY && String(process.env.DEEPGRAM_API_KEY).trim();
    const enabled = String(process.env.DEEPGRAM_LIVE || '').trim() === '1';
    if (!enabled || !apiKey) {
        try { client.send(JSON.stringify({ type: 'error', error: 'Live STT is off. Set DEEPGRAM_LIVE=1 and DEEPGRAM_API_KEY.' })); } catch (_) {}
        client.close();
        return;
    }

    const dgUrl = getDeepgramLiveWsUrl();
    const dg = new WebSocket(dgUrl, { headers: { Authorization: `Token ${apiKey}` } });
    try {
        console.log('[live] deepgram url:', dgUrl);
    } catch (_) {}

    let dgKeepAlive = null;
    let ended = false;
    const liveAudioDebug = String(process.env.DEEPGRAM_LIVE_DEBUG || '').trim() === '1';
    let audioBytesWindow = 0;
    let audioDebugTimer = null;

    dg.on('unexpected-response', (_req, res) => {
        let body = '';
        try {
            res.on('data', (c) => {
                body += String(c);
            });
            res.on('end', () => {
                try {
                    console.error(`[live] deepgram handshake failed ${res.statusCode}: ${body.slice(0, 800)}`);
                } catch (_) {}
                try {
                    client.send(
                        JSON.stringify({
                            type: 'error',
                            error: `Deepgram WS handshake ${res.statusCode}: ${body.slice(0, 400)}`,
                        })
                    );
                } catch (_) {}
                try {
                    client.close(1000, 'Deepgram handshake failed');
                } catch (_) {}
                try {
                    dg.close();
                } catch (_) {}
            });
        } catch (_) {
            try {
                client.send(JSON.stringify({ type: 'error', error: `Deepgram WS unexpected response: ${res.statusCode}` }));
            } catch (__) {}
            try {
                client.close(1000, 'Deepgram handshake failed');
            } catch (__) {}
            try {
                dg.close();
            } catch (__) {}
        }
    });

    dg.on('open', () => {
        try { console.log('[live] deepgram open'); } catch (_) {}
        try { client.send(JSON.stringify({ type: 'ready' })); } catch (_) {}
        try {
            dgKeepAlive = setInterval(() => {
                try {
                    if (dg.readyState === WebSocket.OPEN) dg.send(JSON.stringify({ type: 'KeepAlive' }));
                } catch (_) {}
            }, 3000);
        } catch (_) {}
    });

    dg.on('message', (data) => {
        let msg;
        try {
            msg = JSON.parse(String(data));
        } catch (_) {
            return;
        }
        if (msg?.type === 'Error' || msg?.error || msg?.err_msg) {
            const detail = msg?.description || msg?.message || msg?.error || msg?.err_msg || 'Deepgram error';
            try { client.send(JSON.stringify({ type: 'error', error: `Deepgram: ${detail}` })); } catch (_) {}
            try { client.close(1000, 'Deepgram error'); } catch (_) {}
            try { dg.close(); } catch (_) {}
            return;
        }
        const alt = msg?.channel?.alternatives?.[0];
        const transcript = String(alt?.transcript || '').trim();
        if (!transcript) return;
        const isFinal = Boolean(msg?.is_final);
        try {
            client.send(
                JSON.stringify({
                    type: isFinal ? 'final' : 'interim',
                    text: transcript,
                    raw: { is_final: msg?.is_final, speech_final: msg?.speech_final, confidence: alt?.confidence },
                })
            );
        } catch (_) {}
    });

    dg.on('error', (err) => {
        try {
            client.send(JSON.stringify({ type: 'error', error: `Deepgram WS: ${err.message || 'error'}` }));
        } catch (_) {}
        try {
            client.close(1000, 'Deepgram WS error');
        } catch (_) {}
        try {
            dg.close();
        } catch (_) {}
    });

    dg.on('close', (code, reasonBuf) => {
        if (ended) return;
        ended = true;
        if (dgKeepAlive) {
            try { clearInterval(dgKeepAlive); } catch (_) {}
            dgKeepAlive = null;
        }
        const reason = reasonBuf ? String(reasonBuf) : '';
        try {
            console.warn(`[live] deepgram closed code=${code} reason=${reason}`);
        } catch (_) {}
        try {
            client.send(JSON.stringify({ type: 'dg_close', code, reason }));
        } catch (_) {}
        try {
            client.close(1000, 'Deepgram closed');
        } catch (_) {}
    });
    client.on('close', () => {
        ended = true;
        if (dgKeepAlive) {
            try { clearInterval(dgKeepAlive); } catch (_) {}
            dgKeepAlive = null;
        }
        if (audioDebugTimer) {
            try { clearInterval(audioDebugTimer); } catch (_) {}
            audioDebugTimer = null;
        }
        try { dg.send(JSON.stringify({ type: 'CloseStream' })); } catch (_) {}
        try { dg.close(); } catch (_) {}
    });

    client.on('message', (chunk, isBinary) => {
        if (!isBinary) return;
        if (dg.readyState !== WebSocket.OPEN) return;
        if (liveAudioDebug) {
            audioBytesWindow += chunk.length;
            if (!audioDebugTimer) {
                audioDebugTimer = setInterval(() => {
                    try {
                        console.log(`[live] PCM → Deepgram ~${audioBytesWindow} bytes / 3s (if 0, phone is not sending audio)`);
                    } catch (_) {}
                    audioBytesWindow = 0;
                }, 3000);
            }
        }
        // Forward raw PCM frames
        try { dg.send(chunk); } catch (_) {}
    });
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`
[!] Port ${PORT} is already in use.
    Common cause: you started node, then pressed Ctrl+Z — the process is still alive (suspended) and owns the port.

    Fix (pick one):
      fg              # bring job to foreground, then press Ctrl+C
      kill %1         # kill most recent background job (adjust %% number if needed)
      kill $(lsof -t -iTCP:${PORT} -sTCP:LISTEN)   # kill whatever is listening
`);
    } else {
        console.error('[!] HTTPS server error:', err.message);
    }
    process.exit(1);
});

server.listen(PORT, '0.0.0.0', () => {
    const { ip, iface } = getWifiIP();
    const googleIssues = getGoogleSttEnvIssues();
    if (googleIssues.length) {
        console.warn('[Google STT] Credential problems (voice may use another provider until fixed):');
        for (const msg of googleIssues) console.warn(msg);
    }
    const mic = getMicMode();
    console.log("=========================================");
    console.log(`  FOOK'n OATS Bridge — Port ${PORT} (HTTPS)`);
    console.log(`  Firing at MA3: ${MA3_IP}:${MA3_PORT}`);
    console.log(`  WiFi: ${iface} @ ${ip}`);
    console.log(`  Open in iPhone Safari: https://${ip}:${PORT}`);
    console.log(`  STT fixes loaded: ${sttFixes.length} | Terminology entries: ${ma3Terminology.entries?.length ?? 0}`);
    console.log(`  env file: ${envFilePath}`);
    console.log(
        mic.mode === 'cloud'
            ? `  Hold-to-talk: cloud STT (${mic.cloud}) — default order prefers Deepgram when keys exist`
            : mic.mode === 'browser'
              ? '  Hold-to-talk: Safari / on-device Web Speech (free, no cloud STT keys)'
              : '  Hold-to-talk: OFF — add DEEPGRAM_API_KEY or enable browser fallback (STT_BROWSER=1, default)'
    );
    const llm = getLlmConfig();
    console.log(
        llm
            ? `  LLM copilot: ON (${llm.provider} / ${llm.model})`
            : "  LLM copilot: OFF — set GEMINI_API_KEY (default) or OPENAI / ANTHROPIC (+ optional LLM_PROVIDER)"
    );
    console.log("=========================================");
    console.log("  NOTE: Safari will warn 'not secure' —");
    console.log("  tap Advanced -> proceed anyway. Once only.");
    console.log("=========================================");
});
