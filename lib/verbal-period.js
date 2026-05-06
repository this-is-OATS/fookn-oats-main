/**
 * Map spoken "point" / "dot" to a period character, but keep decimal-style
 * phrases like "one point five" intact for applySpokenNumerals.
 */

const NUM_WORD =
    'zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|and';

/** Spoken number chunk + point + spoken number chunk (decimal). */
const DECIMAL_POINT_PHRASE = new RegExp(
    `\\b(?:${NUM_WORD})(?:\\s+(?:${NUM_WORD})){0,9}\\s+point\\s+(?:${NUM_WORD})(?:\\s+(?:${NUM_WORD})){0,9}\\b`,
    'gi'
);

/**
 * @param {string} text
 * @returns {string}
 */
function applyVerbalPeriodWords(text) {
    let s = String(text || '');
    const holders = [];
    s = s.replace(DECIMAL_POINT_PHRASE, (m) => {
        const id = holders.length;
        holders.push(m);
        return ` __DECPH_${id}__ `;
    });
    s = s.replace(/\bdot\b/gi, '.');
    s = s.replace(/\bpoint\b/gi, '.');
    s = s.replace(/__DECPH_(\d+)__/g, (_, i) => holders[Number(i)] ?? '');
    return s.replace(/\s+/g, ' ').trim();
}

module.exports = { applyVerbalPeriodWords };
