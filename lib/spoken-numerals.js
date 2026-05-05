/**
 * Turn common English spoken numbers into digits for MA-style commands.
 * Runs after STT fixes, before OATS. Conservative: only replaces when the
 * word sequence parses cleanly as an integer (no leftover tokens).
 */

const { getNumeralChunkConflictRegex } = require('./oats-voice-guards');

const W = {
    zero: 0,
    one: 1,
    two: 2,
    three: 3,
    four: 4,
    five: 5,
    six: 6,
    seven: 7,
    eight: 8,
    nine: 9,
    ten: 10,
    eleven: 11,
    twelve: 12,
    thirteen: 13,
    fourteen: 14,
    fifteen: 15,
    sixteen: 16,
    seventeen: 17,
    eighteen: 18,
    nineteen: 19,
    twenty: 20,
    thirty: 30,
    forty: 40,
    fifty: 50,
    sixty: 60,
    seventy: 70,
    eighty: 80,
    ninety: 90,
};

const MA_KEYWORD =
    'Fixture|Fixtures|Group|Groups|Cue|Cues|Executor|Preset|Sequence|Macro|Page|Layout|World';

/** Only matches spoken-number tokens so we do not eat "at fifty" after "fixture twenty one". */
const NUM_WORD =
    'zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|and';
const NUM_CHUNK = `(?:${NUM_WORD})(?:\\s+(?:${NUM_WORD})){0,7}`;

function chunkHasNumeralConflict(lowPhrase) {
    return getNumeralChunkConflictRegex().test(lowPhrase);
}

function tokensToInt(tokens) {
    const t = tokens.map((x) => String(x || '').toLowerCase()).filter((x) => x && x !== 'and');
    if (!t.length) return null;
    let i = 0;
    const n = t.length;

    function take0to99() {
        if (i >= n) return null;
        const w = t[i];
        if (!W[w]) return null;
        if (W[w] < 20) {
            i += 1;
            return W[w];
        }
        if (W[w] % 10 === 0 && W[w] < 100) {
            let v = W[w];
            i += 1;
            if (i < n && W[t[i]] !== undefined && W[t[i]] < 10) {
                v += W[t[i]];
                i += 1;
            }
            return v;
        }
        return null;
    }

    let total = 0;
    const first = take0to99();
    if (first === null) return null;
    if (i < n && t[i] === 'hundred') {
        i += 1;
        total = first * 100;
        if (i < n) {
            const rem = take0to99();
            if (rem === null) return null;
            total += rem;
        }
    } else {
        total = first;
    }
    if (i < n) return null;
    return total;
}

function tryReplacePhrase(phrase) {
    const raw = String(phrase || '').trim();
    if (!raw) return null;
    const tokens = raw.split(/\s+/);
    const v = tokensToInt(tokens);
    if (v === null) return null;
    return String(v);
}

/**
 * @param {string} text
 * @returns {string}
 */
function applySpokenNumerals(text) {
    let s = String(text || '');

    s = s.replace(new RegExp(`\\b(${MA_KEYWORD})\\s+(${NUM_CHUNK})\\b`, 'gi'), (full, kw, phrase) => {
        const low = phrase.toLowerCase();
        if (chunkHasNumeralConflict(low)) return full;
        const rep = tryReplacePhrase(phrase.replace(/\band\b/gi, ' ').trim());
        if (!rep) return full;
        return `${kw} ${rep}`;
    });

    s = s.replace(new RegExp(`\\bAt\\s+(${NUM_CHUNK})\\b`, 'gi'), (full, phrase) => {
        const low = phrase.toLowerCase();
        if (chunkHasNumeralConflict(low)) return full;
        const rep = tryReplacePhrase(phrase.replace(/\band\b/gi, ' ').trim());
        if (!rep) return full;
        return `At ${rep}`;
    });

    s = s.replace(new RegExp(`\\b(${NUM_CHUNK})\\s+Thru\\s+(${NUM_CHUNK})\\b`, 'gi'), (full, a, b) => {
        const left = tryReplacePhrase(a.replace(/\band\b/gi, ' ').trim());
        const right = tryReplacePhrase(b.replace(/\band\b/gi, ' ').trim());
        if (!left || !right) return full;
        return `${left} Thru ${right}`;
    });

    s = s.replace(
        new RegExp(`\\b(${MA_KEYWORD})\\s+(\\d+)\\s+Thru\\s+(${NUM_CHUNK})\\b`, 'gi'),
        (full, kw, leftDigit, rhs) => {
            const right = tryReplacePhrase(rhs.replace(/\band\b/gi, ' ').trim());
            if (!right) return full;
            return `${kw} ${leftDigit} Thru ${right}`;
        }
    );

    s = s.replace(
        new RegExp(`\\b(${MA_KEYWORD})\\s+(${NUM_CHUNK})\\s+Thru\\s+(\\d+)\\b`, 'gi'),
        (full, kw, lhs, rightDigit) => {
            const left = tryReplacePhrase(lhs.replace(/\band\b/gi, ' ').trim());
            if (!left) return full;
            return `${kw} ${left} Thru ${rightDigit}`;
        }
    );

    return s.replace(/\s{2,}/g, ' ').trim();
}

module.exports = { applySpokenNumerals };
