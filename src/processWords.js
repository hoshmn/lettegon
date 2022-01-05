const fs = require("fs");
// const words = require("./wordChecker.json");
// NOTE: dump a JSON word list in wordChecker.json to
// currently using:
// https://github.com/dwyl/english-words/blob/master/words_dictionary.json
// could also use:
// https://github.com/nicoleyatian/word/blob/master/server/game/spellCheck.js
const words = {};

const output = {};
const ks = Object.keys(words);
console.log(ks.length);
ks.forEach((w) => {
  // only take 3+ letter words
  if (w.length <= 2) return;
  // don't take words with duplicated letters
  if (w.split("").some((l, i) => l === w[i + 1])) return;
  output[w] = 1;
});
fs.writeFileSync("wordList.json", JSON.stringify(output));
