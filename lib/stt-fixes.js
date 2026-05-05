const fs = require('fs');
const path = require('path');

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadSttFixes(dir) {
    const file = path.join(dir, 'data', 'stt-fixes.json');
    try {
        const raw = fs.readFileSync(file, 'utf8');
        const arr = JSON.parse(raw);
        return Array.isArray(arr) ? arr.filter((x) => x && x.from && x.to !== undefined) : [];
    } catch (e) {
        console.warn('[stt-fixes] Could not load:', e.message);
        return [];
    }
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

module.exports = { loadSttFixes, applySttFixes };
