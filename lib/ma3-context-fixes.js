/**
 * Context-aware fixes that should NOT apply to normal English.
 *
 * Example: Deepgram often hears "At" as "its/it's". We only want to rewrite that
 * when it is being used like a value delimiter (followed by a level/value),
 * not in phrases like "its fine".
 */
 
const NUM_WORD =
  'zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|and';
const NUM_CHUNK = `(?:${NUM_WORD})(?:\\s+(?:${NUM_WORD})){0,7}`;
 
// Next token looks like a level/value (digits, common value words, or spoken number chunk).
const VALUE_FOLLOW = `(?:\\d+|full|half|zero|out|blind|home|reset|${NUM_CHUNK})`;
 
/**
 * @param {string} text
 * @returns {string}
 */
function applyMa3ContextFixes(text) {
  let s = String(text || '');
 
  // Only rewrite its/it's → At when followed by a value-like token.
  s = s.replace(new RegExp(`\\b(?:it\\'s|its)\\b(?=\\s+${VALUE_FOLLOW}\\b)`, 'gi'), 'At');
 
  return s.replace(/\s{2,}/g, ' ').trim();
}
 
module.exports = { applyMa3ContextFixes };

