/**
 * Voice/text → structured MA3 command line + optional Lua + macro outline (Gemini / GPT / Claude).
 * Keys live only on the server (.env).
 */

const MA3_AI_SYSTEM = `You are a grandMA3 lighting programmer assistant. The user speaks in casual language.

Your job:
1) Produce ONE grandMA3 **command line** string suitable for OSC address /cmd with a single string argument (what an operator would type in the command line). Use real MA3 vocabulary: Fixture, Group, At, Full, Thru, Store, ClearAll, Preset, Sequence, Executor, Go, Off, Attribute "Dimmer", etc. If unsure, give your best single-line guess or empty string.
2) Optionally produce a **Lua** fragment that could live inside an MA3 Lua plugin (use comments; use official-style patterns only when you know them — never invent dangerous APIs). If not applicable, use empty string.
3) Optionally produce **macroOutline**: ordered human-readable steps to build a macro (not XML), or empty array.

Rules:
- commandLine must be ONE line, no newlines, no explanation inside that field.
- Never wrap commandLine in quotes unless MA3 syntax requires embedded quotes (e.g. Preset "Color").
- If the user asks only for Lua or only for ideas, still fill commandLine when possible.
- Respond with **valid JSON only** (no markdown fences).

JSON shape:
{"commandLine":"","luaScript":"","macroOutline":[],"rationale":""}`;

function parseGeminiHttpError(status, bodyText) {
    let msg = bodyText;
    try {
        const j = JSON.parse(bodyText);
        msg = j?.error?.message || j?.error?.status || bodyText;
    } catch (_) {}
    const combined = `${status} ${msg}`;
    if (
        status === 429 ||
        /quota|RESOURCE_EXHAUSTED|rate limit|generate_content_free_tier/i.test(combined)
    ) {
        return new Error(
            'Gemini quota or rate limit hit (free tier is easy to exhaust). Options: wait for reset, enable billing in Google AI Studio, switch model via GEMINI_MODEL, or add OPENAI_API_KEY + LLM_PROVIDER=openai. See https://ai.google.dev/gemini-api/docs/rate-limits and https://ai.dev/rate-limit'
        );
    }
    return new Error(`Gemini API error (${status}): ${String(msg).slice(0, 400)}`);
}

function extractJsonObject(raw) {
    let s = String(raw || '').trim();
    if (!s) throw new Error('Empty model response');
    const fence = /^```(?:json)?\s*([\s\S]*?)\s*```$/im.exec(s);
    if (fence) s = fence[1].trim();
    const obj = JSON.parse(s);
    return {
        commandLine: typeof obj.commandLine === 'string' ? obj.commandLine.trim() : '',
        luaScript: typeof obj.luaScript === 'string' ? obj.luaScript.trim() : '',
        macroOutline: Array.isArray(obj.macroOutline)
            ? obj.macroOutline.map((x) => String(x).trim()).filter(Boolean)
            : [],
        rationale: typeof obj.rationale === 'string' ? obj.rationale.trim() : '',
    };
}

function resolveProvider() {
    const p = (process.env.LLM_PROVIDER || '').toLowerCase().trim();
    if (p === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
    if (p === 'anthropic' && process.env.ANTHROPIC_API_KEY) return 'anthropic';
    if ((p === 'google' || p === 'gemini') && process.env.GEMINI_API_KEY) return 'google';
    if (p) return null;
    // Default order: Gemini first for this project when multiple keys exist.
    if (process.env.GEMINI_API_KEY) return 'google';
    if (process.env.OPENAI_API_KEY) return 'openai';
    if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
    return null;
}

function getLlmConfig() {
    const provider = resolveProvider();
    if (!provider) return null;
    const model =
        provider === 'openai'
            ? process.env.OPENAI_MODEL || 'gpt-4o-mini'
            : provider === 'anthropic'
              ? process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022'
              : process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    return { provider, model };
}

async function callOpenAI(userText) {
    const key = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const r = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model,
            temperature: 0.15,
            response_format: { type: 'json_object' },
            messages: [
                { role: 'system', content: MA3_AI_SYSTEM },
                {
                    role: 'user',
                    content: `User said (verbatim):\n${JSON.stringify(userText)}\n\nReturn JSON with keys commandLine, luaScript, macroOutline, rationale.`,
                },
            ],
        }),
    });
    const body = await r.text();
    if (!r.ok) throw new Error(`OpenAI ${r.status}: ${body.slice(0, 400)}`);
    const data = JSON.parse(body);
    const raw = data?.choices?.[0]?.message?.content;
    return extractJsonObject(raw);
}

async function callAnthropic(userText) {
    const key = process.env.ANTHROPIC_API_KEY;
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-haiku-20241022';
    const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'x-api-key': key,
            'anthropic-version': '2023-06-01',
            'content-type': 'application/json',
        },
        body: JSON.stringify({
            model,
            max_tokens: 4096,
            system: MA3_AI_SYSTEM + '\nReturn raw JSON only, no markdown.',
            messages: [
                {
                    role: 'user',
                    content: `User said (verbatim):\n${JSON.stringify(userText)}\n\nReturn JSON with keys commandLine, luaScript, macroOutline, rationale.`,
                },
            ],
        }),
    });
    const body = await r.text();
    if (!r.ok) throw new Error(`Anthropic ${r.status}: ${body.slice(0, 400)}`);
    const data = JSON.parse(body);
    const raw = data?.content?.find((c) => c.type === 'text')?.text;
    return extractJsonObject(raw);
}

async function callGemini(userText) {
    const key = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`;
    const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            systemInstruction: { role: 'system', parts: [{ text: MA3_AI_SYSTEM }] },
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `User said (verbatim):\n${JSON.stringify(userText)}\n\nReturn JSON with keys commandLine, luaScript, macroOutline, rationale only.`,
                        },
                    ],
                },
            ],
            generationConfig: {
                temperature: 0.15,
                responseMimeType: 'application/json',
            },
        }),
    });
    const body = await r.text();
    if (!r.ok) throw parseGeminiHttpError(r.status, body);

    let data;
    try {
        data = JSON.parse(body);
    } catch (e) {
        throw new Error(`Gemini returned non-JSON: ${body.slice(0, 200)}`);
    }

    const cand = data?.candidates?.[0];
    const finish = cand?.finishReason;
    if (!cand || finish === 'SAFETY' || finish === 'BLOCKLIST') {
        throw new Error(
            'Gemini blocked this request (safety). Shorten or rephrase — nothing sent to MA3.'
        );
    }
    const raw = cand?.content?.parts?.[0]?.text;
    return extractJsonObject(raw);
}

/**
 * @param {string} userText - transcript or typed intent
 * @returns {Promise<{ commandLine: string, luaScript: string, macroOutline: string[], rationale: string, provider: string, model: string }>}
 */
async function interpretLighting(userText) {
    const cfg = getLlmConfig();
    if (!cfg) throw new Error('No LLM configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, or GEMINI_API_KEY (and optional LLM_PROVIDER).');

    let parsed;
    if (cfg.provider === 'openai') parsed = await callOpenAI(userText);
    else if (cfg.provider === 'anthropic') parsed = await callAnthropic(userText);
    else if (cfg.provider === 'google') parsed = await callGemini(userText);
    else throw new Error(`Unknown LLM provider: ${cfg.provider}`);

    return {
        ...parsed,
        provider: cfg.provider,
        model: cfg.model,
    };
}

module.exports = {
    getLlmConfig,
    interpretLighting,
};
