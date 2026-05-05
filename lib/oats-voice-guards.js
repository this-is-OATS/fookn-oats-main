const fs = require('fs');
const path = require('path');

let cachedGuards = null;

function loadGuardsFile() {
    if (cachedGuards !== null) return cachedGuards;
    const file = path.join(__dirname, '..', 'data', 'oats-voice-guards.json');
    try {
        const raw = JSON.parse(fs.readFileSync(file, 'utf8'));
        const words = Array.isArray(raw.numeralChunkBlockWords)
            ? raw.numeralChunkBlockWords.map((w) => String(w || '').toLowerCase()).filter(Boolean)
            : [];
        cachedGuards = {
            numeralChunkBlockWords: [...new Set(words)],
            oatsPhraseShields: Array.isArray(raw.oatsPhraseShields) ? raw.oatsPhraseShields : [],
        };
    } catch (e) {
        console.warn('[oats-voice-guards] Could not load oats-voice-guards.json:', e.message);
        cachedGuards = { numeralChunkBlockWords: [], oatsPhraseShields: [] };
    }
    return cachedGuards;
}

/** Words already guarded inside spoken-numerals plus JSON rhyme/confusion blocklist. */
const NUMERAL_BASE_CHUNK = ['full', 'half', 'zero', 'out', 'blind', 'home', 'reset'];

let cachedNumeralConflictRe = null;

/**
 * If this matches inside a spoken-number chunk, skip digit conversion (same idea as full/half/zero).
 * @returns {RegExp}
 */
function getNumeralChunkConflictRegex() {
    if (cachedNumeralConflictRe) return cachedNumeralConflictRe;
    const extra = loadGuardsFile().numeralChunkBlockWords;
    const all = [...new Set([...NUMERAL_BASE_CHUNK, ...extra])];
    cachedNumeralConflictRe = new RegExp(`\\b(?:${all.join('|')})\\b`, 'i');
    return cachedNumeralConflictRe;
}

/**
 * Phrases that should not pass through oats synonym replacement (plain English).
 * Longest patterns first so "grocery store" wins before shorter overlaps.
 * @returns {{ text: string, slots: string[] }}
 */
function shieldOatsPhrases(text) {
    const { oatsPhraseShields } = loadGuardsFile();
    const sorted = [...oatsPhraseShields].sort((a, b) => (b.pattern || '').length - (a.pattern || '').length);
    const slots = [];
    let s = String(text || '');
    for (const entry of sorted) {
        const pat = entry && entry.pattern;
        if (!pat) continue;
        let re;
        try {
            re = new RegExp(pat, entry.flags || 'gi');
        } catch (e) {
            console.warn('[oats-voice-guards] Bad shield pattern:', pat, e.message);
            continue;
        }
        s = s.replace(re, (match) => {
            const id = slots.length;
            slots.push(match);
            return ` __OATS_SHIELD_${id}__ `;
        });
    }
    return { text: s.replace(/\s{2,}/g, ' ').trim(), slots };
}

/**
 * Restore placeholders after oatsTranslate.
 * @param {string} text
 * @param {string[]} slots
 * @returns {string}
 */
function unshieldOatsPhrases(text, slots) {
    let s = String(text || '');
    if (!slots || !slots.length) return s;
    for (let i = 0; i < slots.length; i++) {
        const token = `__OATS_SHIELD_${i}__`;
        s = s.split(token).join(slots[i]);
    }
    return s.replace(/\s{2,}/g, ' ').trim();
}

module.exports = {
    loadGuardsFile,
    getNumeralChunkConflictRegex,
    shieldOatsPhrases,
    unshieldOatsPhrases,
};
