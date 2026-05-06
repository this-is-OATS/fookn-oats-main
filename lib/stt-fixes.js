const fs = require('fs');
const path = require('path');

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeFixEntry(x) {
    if (!x || typeof x.from !== 'string') return null;
    const from = x.from.trim();
    if (!from) return null;
    const to = x.to === undefined || x.to === null ? '' : String(x.to);
    return { from, to };
}

function readFixFile(filePath) {
    try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];
        return arr.map(normalizeFixEntry).filter(Boolean);
    } catch (e) {
        if (e.code !== 'ENOENT') console.warn('[stt-fixes] Could not load', filePath, e.message);
        return [];
    }
}

/** Shipped defaults (read-only in UI). */
function loadSttFixesDefault(dir) {
    return readFixFile(path.join(dir, 'data', 'stt-fixes.json'));
}

/** Your overrides — editable on /settings.html, saved here. */
function loadSttFixesUser(dir) {
    return readFixFile(path.join(dir, 'data', 'stt-fixes-user.json'));
}

/** Backwards-compatible name: default file only (avoid for pipeline). */
function loadSttFixes(dir) {
    return loadSttFixesDefault(dir);
}

/**
 * User entries first so equal-length matches prefer your fixes (stable sort).
 */
function loadMergedSttFixes(dir) {
    const user = loadSttFixesUser(dir);
    const base = loadSttFixesDefault(dir);
    return [...user, ...base].filter((x) => x && x.from && x.to !== undefined);
}

const MAX_USER_FIXES = 400;
const MAX_FIX_LEN = 240;

function validateUserFixesList(fixes) {
    if (!Array.isArray(fixes)) return { ok: false, error: 'Body must be { "fixes": [ { "from", "to" }, ... ] }' };
    if (fixes.length > MAX_USER_FIXES) return { ok: false, error: `At most ${MAX_USER_FIXES} entries` };
    const out = [];
    for (const x of fixes) {
        const n = normalizeFixEntry(x);
        if (!n) continue;
        if (n.from.length > MAX_FIX_LEN || n.to.length > MAX_FIX_LEN) {
            return { ok: false, error: `Each from/to must be ≤ ${MAX_FIX_LEN} characters` };
        }
        out.push(n);
    }
    return { ok: true, fixes: out };
}

function saveSttFixesUser(dir, fixes) {
    const file = path.join(dir, 'data', 'stt-fixes-user.json');
    fs.writeFileSync(file, JSON.stringify(fixes, null, 2) + '\n', 'utf8');
}

/**
 * Apply lighting-domain corrections before the OATS translator.
 * Longest `from` phrases first to reduce accidental partial matches.
 */
function applySttFixes(text, fixes) {
    if (!fixes.length) return text;
    let t = String(text);
    const sorted = [...fixes].sort((a, b) => b.from.length - a.from.length);
    for (const fix of sorted) {
        const parts = fix.from.trim().split(/\s+/).map(escapeRegex);
        const inner = parts.join('\\s+');
        const re = new RegExp(`\\b${inner}\\b`, 'gi');
        t = t.replace(re, fix.to);
    }
    return t;
}

module.exports = {
    loadSttFixes,
    loadSttFixesDefault,
    loadSttFixesUser,
    loadMergedSttFixes,
    applySttFixes,
    validateUserFixesList,
    saveSttFixesUser,
};
