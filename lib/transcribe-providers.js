/**
 * Cloud STT for hold-to-record.
 * Supports Deepgram, OpenAI gpt-4o-transcribe, and Google Cloud Speech.
 */

const fs = require('fs');
const { SpeechClient } = require('@google-cloud/speech');
/** Default to Nova 2 (widest access on Deepgram projects). */
const DEFAULT_DG_MODEL = 'nova-2';

function dgKeywordsQuery() {
    const raw = process.env.DEEPGRAM_KEYWORDS;
    if (raw) return raw.startsWith('&') ? raw : `&${raw}`;
    // Boost MA / lighting terms the phone mic often garbles
    const pairs = [
        'fixture:4',
        'fixtures:3',
        'phaser:4',
        'Thru:3',
        'gobo:3',
        'dimmer:3',
        'grandMA:3',
        'grandMA3:3',
        'Executor:3',
        'Preset:3',
        'Sequence:3',
        'Cue:3',
        'Macro:2',
        'Layout:2',
        'Page:2',
        'World:2',
        'Programmer:2',
        'Highlight:2',
        'Solo:2',
        'Blind:2',
        'Freeze:2',
        'Release:2',
        'Clone:2',
        'Copy:2',
        'Move:2',
        'At:2',
        'Full:2',
        'Stomp:2',
    ];
    return pairs.map((k) => `&keywords=${encodeURIComponent(k)}`).join('');
}

function dgExtraQuery() {
    const raw = String(process.env.DEEPGRAM_EXTRA_QUERY || '').trim();
    if (!raw) return '';
    // Accept either "a=b&c=d" or "&a=b&c=d"
    return raw.startsWith('&') ? raw : `&${raw}`;
}

function dgLiveExtraQuery() {
    const raw = String(process.env.DEEPGRAM_LIVE_EXTRA_QUERY || '').trim();
    if (!raw) return '';
    return raw.startsWith('&') ? raw : `&${raw}`;
}

function getDeepgramLiveWsUrl() {
    const model = process.env.DEEPGRAM_MODEL || DEFAULT_DG_MODEL;
    const lang = process.env.DEEPGRAM_LANGUAGE || 'en';
    const qs = new URLSearchParams({
        model,
        language: lang,
        // For raw PCM frames sent over websocket:
        encoding: 'linear16',
        sample_rate: '16000',
        channels: '1',
        interim_results: 'true',
    });
    // Live WS: start minimal to avoid 400s; add features back via DEEPGRAM_LIVE_EXTRA_QUERY.
    // If you want keyterm boosting, set DEEPGRAM_LIVE_KEYTERMS explicitly.
    const keytermsRaw = String(process.env.DEEPGRAM_LIVE_KEYTERMS || '').trim();
    if (keytermsRaw) {
        const parts = keytermsRaw
            .split(/[|,]/)
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 40);
        for (const t of parts) qs.append('keyterm', t);
    }
    return `wss://api.deepgram.com/v1/listen?${qs.toString()}${dgLiveExtraQuery()}`;
}

function hasUsableGoogleCredentials() {
    const jsonRaw = process.env.GOOGLE_CLOUD_KEY_JSON && String(process.env.GOOGLE_CLOUD_KEY_JSON).trim();
    if (jsonRaw) {
        try {
            JSON.parse(jsonRaw);
            return true;
        } catch {
            return false;
        }
    }
    const p = process.env.GOOGLE_APPLICATION_CREDENTIALS && String(process.env.GOOGLE_APPLICATION_CREDENTIALS).trim();
    if (!p) return false;
    try {
        return fs.statSync(p).isFile();
    } catch {
        return false;
    }
}

/** @returns {string[]} Human-readable issues (empty if nothing to warn). */
function getGoogleSttEnvIssues() {
    const issues = [];
    const jsonRaw = process.env.GOOGLE_CLOUD_KEY_JSON && String(process.env.GOOGLE_CLOUD_KEY_JSON).trim();
    if (jsonRaw) {
        try {
            JSON.parse(jsonRaw);
        } catch {
            issues.push('GOOGLE_CLOUD_KEY_JSON is set but is not valid JSON.');
        }
    }
    const p = process.env.GOOGLE_APPLICATION_CREDENTIALS && String(process.env.GOOGLE_APPLICATION_CREDENTIALS).trim();
    if (p) {
        try {
            const st = fs.statSync(p);
            if (!st.isFile()) issues.push(`GOOGLE_APPLICATION_CREDENTIALS is not a file: ${p}`);
        } catch (e) {
            if (e.code === 'ENOENT') {
                issues.push(
                    `GOOGLE_APPLICATION_CREDENTIALS points to a missing file:\n    ${p}\n` +
                        '    Fix: In Google Cloud Console → IAM → Service accounts → your SA → Keys → Add key (JSON). ' +
                        'Save the file at that path, or paste the JSON (one line) as GOOGLE_CLOUD_KEY_JSON in ma3.env / .env.'
                );
            } else {
                issues.push(`GOOGLE_APPLICATION_CREDENTIALS: ${p} — ${e.message}`);
            }
        }
    }
    return issues;
}

function isSttProviderBrowserForced() {
    const p = String(process.env.STT_PROVIDER || '').toLowerCase().trim();
    return ['browser', 'webkit', 'safari', 'free', 'ondevice'].includes(p);
}

/** When false, the UI will not offer Web Speech (on-device) fallback. Default: on. */
function isBrowserSttFallbackEnabled() {
    const v = String(process.env.STT_BROWSER || '1').toLowerCase().trim();
    return v !== '0' && v !== 'false' && v !== 'off' && v !== 'no';
}

function getVoiceSttBackend() {
    const forced = String(process.env.STT_PROVIDER || '').toLowerCase().trim();
    if (isSttProviderBrowserForced()) return null;

    const hasDeepgram = Boolean(process.env.DEEPGRAM_API_KEY && String(process.env.DEEPGRAM_API_KEY).trim());
    const hasOpenAI = Boolean(process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim());
    const hasGoogle = hasUsableGoogleCredentials();

    if (forced) {
        if (forced === 'openai' && hasOpenAI) return 'openai';
        if (forced === 'deepgram' && hasDeepgram) return 'deepgram';
        if ((forced === 'google' || forced === 'google_cloud') && hasGoogle) return 'google_cloud';
        return null;
    }

    // Default: free-tier-friendly order (Deepgram credits first), then paid cloud STT.
    if (hasDeepgram) return 'deepgram';
    if (hasOpenAI) return 'openai';
    if (hasGoogle) return 'google_cloud';
    return null;
}

/** How the hold-to-talk mic should behave on the client. */
function getMicMode() {
    const cloud = getVoiceSttBackend();
    const forceBrowser = isSttProviderBrowserForced();
    const browserOk = isBrowserSttFallbackEnabled();
    const browserOffered = browserOk && (!cloud || forceBrowser);
    if (cloud && !forceBrowser) return { mode: 'cloud', cloud, browserOffered: false };
    if (browserOffered) return { mode: 'browser', cloud: null, browserOffered: true };
    return { mode: 'none', cloud: null, browserOffered: false };
}

/**
 * @param {Buffer} buffer
 * @param {string} [mimetype]
 * @returns {Promise<string>}
 */
async function transcribeWithDeepgram(buffer, mimetype) {
    const apiKey = process.env.DEEPGRAM_API_KEY && String(process.env.DEEPGRAM_API_KEY).trim();
    if (!apiKey) throw new Error('DEEPGRAM_API_KEY is not set');

    const requestedModel = process.env.DEEPGRAM_MODEL || DEFAULT_DG_MODEL;
    const lang = process.env.DEEPGRAM_LANGUAGE || 'en';
    const ct =
        mimetype && mimetype !== 'application/octet-stream'
            ? mimetype
            : 'audio/webm';

    async function attempt(model) {
        const qs = new URLSearchParams({
            model,
            language: lang,
            smart_format: 'true',
            punctuate: 'true',
            numerals: 'true',
        });
        if (String(process.env.DEEPGRAM_DICTATION || '').trim() === '1') {
            qs.set('dictation', 'true');
        }
        if (String(process.env.DEEPGRAM_DIARIZE || '').trim() === '1') {
            qs.set('diarize', 'true');
        }
        if (String(process.env.DEEPGRAM_UTTERANCES || '').trim() === '1') {
            qs.set('utterances', 'true');
        }
        const url = `https://api.deepgram.com/v1/listen?${qs.toString()}${dgKeywordsQuery()}${dgExtraQuery()}`;

        const r = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: `Token ${apiKey}`,
                'Content-Type': ct,
            },
            body: buffer,
        });

        const bodyText = await r.text();
        if (!r.ok) {
            let detail = bodyText;
            try {
                const j = JSON.parse(bodyText);
                detail = j.err_msg || j.message || bodyText;
            } catch (_) {}
            const err = new Error(`Deepgram ${r.status}: ${detail}`.slice(0, 500));
            err.status = r.status;
            err.detail = detail;
            throw err;
        }

        let data;
        try {
            data = JSON.parse(bodyText);
        } catch (e) {
            throw new Error('Deepgram returned non-JSON');
        }

        let transcript = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;
        if (!String(transcript || '').trim() && Array.isArray(data?.results?.utterances) && data.results.utterances.length) {
            transcript = data.results.utterances.map((u) => u.transcript || '').join(' ');
        }
        return (transcript || '').trim();
    }

    try {
        return await attempt(requestedModel);
    } catch (e) {
        const detail = String(e?.detail || e?.message || '');
        const looksLikeModel403 =
            (e?.status === 403 || detail.includes('403')) &&
            /access to the requested model/i.test(detail);
        if (looksLikeModel403 && requestedModel !== 'nova-2') {
            // Free-tier projects often only have nova-2.
            return await attempt('nova-2');
        }
        throw e;
    }
}

/**
 * @param {Buffer} buffer
 * @param {string} [mimetype]
 * @returns {Promise<string>}
 */
async function transcribeWithOpenAI(buffer, mimetype) {
    const apiKey = process.env.OPENAI_API_KEY && String(process.env.OPENAI_API_KEY).trim();
    if (!apiKey) throw new Error('OPENAI_API_KEY is not set');

    const model = process.env.OPENAI_TRANSCRIBE_MODEL || 'gpt-4o-transcribe';
    const ct =
        mimetype && mimetype !== 'application/octet-stream'
            ? mimetype
            : 'audio/webm';
    const ext =
        ct.includes('mp4') || ct.includes('m4a') ? 'm4a'
        : ct.includes('wav') ? 'wav'
        : 'webm';

    const form = new FormData();
    form.append('model', model);
    form.append('language', process.env.OPENAI_TRANSCRIBE_LANGUAGE || 'en');
    form.append('file', new Blob([buffer], { type: ct }), `clip.${ext}`);

    const r = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
    });

    const bodyText = await r.text();
    if (!r.ok) {
        let detail = bodyText;
        try {
            const j = JSON.parse(bodyText);
            detail = j?.error?.message || j?.message || bodyText;
        } catch (_) {}
        throw new Error(`OpenAI STT ${r.status}: ${detail}`.slice(0, 500));
    }

    let data;
    try {
        data = JSON.parse(bodyText);
    } catch (_) {
        throw new Error('OpenAI STT returned non-JSON');
    }
    return String(data?.text || '').trim();
}

function getGoogleSpeechClient() {
    const raw = process.env.GOOGLE_CLOUD_KEY_JSON && String(process.env.GOOGLE_CLOUD_KEY_JSON).trim();
    if (raw) {
        let credentials;
        try {
            credentials = JSON.parse(raw);
        } catch (e) {
            throw new Error('GOOGLE_CLOUD_KEY_JSON is not valid JSON');
        }
        return new SpeechClient({ credentials });
    }
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS && String(process.env.GOOGLE_APPLICATION_CREDENTIALS).trim();
    if (credPath) {
        try {
            if (!fs.existsSync(credPath) || !fs.statSync(credPath).isFile()) {
                throw new Error(
                    `Service account JSON not found: ${credPath}. Add the key file from Google Cloud (IAM → Service accounts) or set GOOGLE_CLOUD_KEY_JSON in your env file.`
                );
            }
        } catch (e) {
            if (e.code === 'ENOENT') {
                throw new Error(
                    `Service account JSON not found: ${credPath}. Download a JSON key from Google Cloud and save it there, or use GOOGLE_CLOUD_KEY_JSON=...`
                );
            }
            throw e;
        }
    }
    return new SpeechClient();
}

function inferGoogleEncoding(mimetype) {
    const ct = String(mimetype || '').toLowerCase();
    if (ct.includes('webm')) return 'WEBM_OPUS';
    if (ct.includes('ogg')) return 'OGG_OPUS';
    if (ct.includes('wav') || ct.includes('wave')) return 'LINEAR16';
    if (ct.includes('flac')) return 'FLAC';
    return null;
}

/**
 * @param {Buffer} buffer
 * @param {string} [mimetype]
 * @returns {Promise<string>}
 */
async function transcribeWithGoogleCloud(buffer, mimetype) {
    const client = getGoogleSpeechClient();
    const languageCode = process.env.GOOGLE_CLOUD_LANGUAGE || 'en-US';
    const model = process.env.GOOGLE_CLOUD_MODEL || 'latest_short';
    const encoding = inferGoogleEncoding(mimetype);

    const request = {
        audio: { content: buffer.toString('base64') },
        config: {
            languageCode,
            model,
            enableAutomaticPunctuation: true,
        },
    };
    if (encoding) {
        request.config.encoding = encoding;
    }

    let response;
    try {
        [response] = await client.recognize(request);
    } catch (err) {
        throw new Error(`Google STT: ${err.message || 'recognize failed'}`);
    }

    const transcript = (response.results || [])
        .map((r) => (r.alternatives && r.alternatives[0] ? r.alternatives[0].transcript : ''))
        .join(' ')
        .trim();
    return transcript;
}

module.exports = {
    getVoiceSttBackend,
    getMicMode,
    isSttProviderBrowserForced,
    isBrowserSttFallbackEnabled,
    getDeepgramLiveWsUrl,
    getGoogleSttEnvIssues,
    transcribeWithDeepgram,
    transcribeWithOpenAI,
    transcribeWithGoogleCloud,
};
