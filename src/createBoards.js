import _ from "lodash";
let r = 0;
const cacheKeyTracker = {};

const xEmpty = (x) => x === "_";
const truncateCap = 1000;
const globalCap = 12000;

// console.log(makeId(4, 3));
function makeId(sideCount, sideSize) {
  const str = Array(sideCount).fill(Array(sideSize).fill("_"));
  // console.log("STR", str.map(r => r.join("")).join("|"))
  return boardMatrixToString(str);
  // return Array(sideCount).fill(Array(sideSize).fill("_"))
}

class Lettegon {
  constructor({ sideCount, sideSize, id, boardMtx, prevSide }) {
    if (id && boardMtx) console.warn("do you want to pass in both?");

    if (!prevSide && prevSide !== 0) prevSide = -1;
    this.sideCount = sideCount;
    this.sideSize = sideSize;
    this.prevSide = prevSide;
    // this.invalid = false;

    // TODO: do we need id AND boardMtx before the edit configuration phase?
    this.id =
      id ||
      (boardMtx && boardMatrixToString(boardMtx)) ||
      makeId(sideCount, sideSize);
    this.boardMtx = boardMtx || boardStringToMatrix(this.id);
    this.complete = this.boardMtx.every((s) => s.every(_.negate(xEmpty)));
  }

  cloneWithAddition({ sideIndex, side, letter }) {
    const position = _.findIndex(this.boardMtx[sideIndex], xEmpty);
    const newMtx = _.cloneDeep(this.boardMtx);

    newMtx[sideIndex][position] = letter;
    // console.log("&&", sideIndex, position, side, letter, newMtx);
    return new Lettegon({
      sideCount: this.sideCount,
      sideSize: this.sideSize,
      // id: this.id,
      boardMtx: newMtx,
      prevSide: sideIndex
    });
  }

  branchByLetter(letter) {
    // the previous side already contains the added letter, board now invalid
    if (this.prevSide >= 0 && this.boardMtx[this.prevSide].includes(letter)) {
      // console.log(this.id, " is invalid.");
      return [];
    }

    // letter contained by some other side, board valid just update prevSide
    if (
      this.boardMtx.some((s, i) => {
        const included = s.includes(letter);
        if (included) this.prevSide = i;
        return included;
      })
    ) {
      // console.log(this.id, " contained letter already.");
      return [this];
    }

    // complete boards that don't fit into the above are now invalid
    if (this.complete) {
      // this.invalid = true;
      // console.log(this.id, " is complete.")
      return [];
    }

    // if (this.invalid) {
    //   // console.log(this.id, " is invalid.");
    //   return [];
    // }

    // only include one permutation where new letter added to empty side
    let emptySideUsed = false;
    const branches = [];

    this.boardMtx.forEach((side, sideIndex) => {
      // can't add letter to the previous side (or a full one)
      const viable = sideIndex !== this.prevSide && side.some(xEmpty);
      if (viable) {
        const empty = side.every(xEmpty);

        // all non-empty sides are necessarily unique, so create branches
        if (!empty || !emptySideUsed) {
          // if this was an empty side, update emptySideUsed to skip others
          emptySideUsed = emptySideUsed || empty;
          branches.push(
            this.cloneWithAddition({
              side,
              sideIndex,
              letter
            })
          );
        }
      }
    });
    // console.log("BS: ", branches)
    return branches;
  }
}

// const memCreateBoards = _.memoize(createBoards);

const processLettegonsResolver = ({
  letter,
  usedLetters,
  truncate,
  sideCount,
  sideSize
}) => `${letter}-${usedLetters}-${sideCount}-${sideSize}-${truncate}`;

// NOTE: if adding inputs that determine the shape of the output,
// be sure to update the memoization resolver function above
// (determines when to used cached result)
function processLettegons({
  letter,
  usedLetters, // for memoization
  resultFraction,
  sideCount,
  sideSize,
  truncate,
  lettegons
}) {
  // debugger;
  let pLettegons = _.chain(lettegons)
    .map((L) => L.branchByLetter(letter))
    .flatten(lettegons)
    // .compact(lettegons) // now all branchBy returns are []s
    .value();

  // truncate for perf
  if (
    pLettegons.length > globalCap ||
    (truncate && pLettegons.length > truncateCap)
  ) {
    const truncateRatio = Math.ceil(pLettegons.length / truncateCap);
    const before = pLettegons.length;
    pLettegons = pLettegons.filter((l, i) => !(i % truncateRatio));
    const fractionKept = pLettegons.length / before;
    // console.log(
    //   "for '",
    //   letter,
    //   "' keeping:",
    //   Math.round(fractionKept * 100) + "%",
    //   before,
    //   pLettegons.length
    // );
    resultFraction *= fractionKept;
  }

  // console.log(
  //   r++,
  //   letter,
  //   usedLetters,
  //   lettegons.length,
  //   resultFraction,
  //   pLettegons.length
  // );
  // console.log(
  //   "PL: ",
  //   `${letter}-${usedLetters}-${sideCount}-${sideSize}-${truncate}`
  // );
  // console.log(pLettegons[0], pLettegons.length);
  return { pLettegons, resultFraction };
}

const memProcessLettegons = _.memoize(processLettegons, (args) => {
  const cacheKey = processLettegonsResolver(args);
  cacheKeyTracker[cacheKey] = true;
  // console.log("!!!!!", cacheKey, Object.keys(cacheKeyTracker).length);
  return cacheKey;
});

function createBoards({ letters, sideCount, sideSize, truncate = false }) {
  // initialize L for first letter
  const L = new Lettegon({ sideCount, sideSize });
  let lettegons = L.branchByLetter(letters[0]);

  let usedLetters = letters[0];
  let resultFraction = 1;
  let ltrIdx = 1;
  let letter = letters[ltrIdx];
  while (letter) {
    // console.log("___", lettegons.length);
    const result = memProcessLettegons({
      letter,
      usedLetters,
      resultFraction,
      truncate,
      sideCount,
      sideSize,
      lettegons
    });
    lettegons = result.pLettegons;
    // console.log("__!", letter, lettegons.length);
    resultFraction *= result.resultFraction;

    usedLetters += letter;
    letter = letters[++ltrIdx];
  }

  return { lettegons, resultFraction };
}

// console.log(boardStringToMatrix("aoe|ue_|s_"))
function boardStringToMatrix(str) {
  return str.split("|").map((s) => s.split(""));
}

function boardMatrixToString(mtx) {
  // TODO: sort
  return mtx.map((s) => s.join("")).join("|");
}

export default createBoards;
