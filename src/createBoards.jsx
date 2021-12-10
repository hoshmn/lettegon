import _ from "lodash";
let r = 0;

const xEmpty = (x) => x === "_";
const truncateCap = 1000;

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
    this.invalid = false;

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
      // console.log(this.id, " is now invalid.");
      this.invalid = true;
      return;
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
      return this;
    }

    // complete boards that don't fit into the above are now invalid
    if (this.complete) {
      this.invalid = true;
      return;
    }

    if (this.invalid) {
      // console.log(this.id, " is invalid.");
      return;
    }

    let emptySideUsed = false;
    const branches = [];

    this.boardMtx.forEach((side, sideIndex) => {
      const viable = sideIndex !== this.prevSide && side.some(xEmpty);
      if (viable) {
        const empty = side.every(xEmpty);

        if (!empty) {
          branches.push(
            this.cloneWithAddition({
              side,
              sideIndex,
              letter
            })
          );
        } else if (!emptySideUsed) {
          emptySideUsed = true;
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

const memCreateBoards = _.memoize(createBoards);

function createBoards({
  letters,
  sideCount,
  sideSize,
  lettegons = [],
  usedLetters = "",
  truncate = false,
  resultFraction = 1
}) {
  // let boardMtx = Array(sideCount).fill(Array(sideSize));
  // console.log(boardMtx)
  // const lettegons = [];

  // letters.split("").forEach((l) => {});
  // console.log(boardMtx, r++);

  if (!letters) return { lettegons, resultFraction };
  const letter = letters[0];
  if (!usedLetters) {
    const L = new Lettegon({ sideCount, sideSize });
    const newL = L.branchByLetter(letter);
    lettegons.push(...newL);
  } else {
    lettegons = lettegons.map((L) => L.branchByLetter(letter));
    // console.log("___", lettegons)
    lettegons = _.compact(lettegons);
    lettegons = _.flatten(lettegons);
    if (truncate && lettegons.length > truncateCap) {
      const truncateRatio = Math.ceil(lettegons.length / truncateCap);
      const before = lettegons.length;
      lettegons = lettegons.filter((l, i) => !(i % truncateRatio));
      const fractionKept = lettegons.length / before;
      console.log(
        "for '",
        letter,
        "' keeping:",
        Math.round(fractionKept * 100) + "%",
        before,
        lettegons.length
      );
      resultFraction *= fractionKept;
    }
  }

  return memCreateBoards({
    letters: letters.slice(1),
    sideCount,
    sideSize,
    lettegons,
    usedLetters: usedLetters + letter,
    truncate,
    resultFraction
  });
}

// console.log(boardStringToMatrix("aoe|ue_|s_"))
function boardStringToMatrix(str) {
  return str.split("|").map((s) => s.split(""));
}

function boardMatrixToString(mtx) {
  // TODO: sort
  return mtx.map((s) => s.join("")).join("|");
}

export default memCreateBoards;
