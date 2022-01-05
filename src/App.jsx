import React from "react";
import createBoards from "./createBoards";
import Lettegon from "./Lettegon";
import Modal from "@mui/material/Modal";
import "./styles.css";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import _ from "lodash";
import { MAX_SIDE_SIZE, MAX_SIDES, MIN_SIDES, MIN_SIDE_SIZE } from "./consts";
import { isValidConfig } from "./utils";

const sideTruncCap = 6;
const forceTruncateTitle = `results automatically capped for Lettegons with ${sideTruncCap} or more sides`;

const CONFIG_PARAM = "c";
const SOLUTION_PARAM = "s";

export default function App() {
  const params = new URLSearchParams(location.search);
  const config = params.get(CONFIG_PARAM);
  const solution = params.get(SOLUTION_PARAM);
  if (isValidConfig(config)) {
    return (
      <PlayLettegon id={config.toUpperCase()} solution={solution} />
    )
  // } else if (location.search) {
    // window.location.pathname = ""; // clear invalid
    // location.search = ""
  }
  
  const [mode, setMode] = React.useState("generate"); // "selection", "edit"
  const [letters, setLetters] = React.useState(
    // "ABCDEFGHIJKL"
    ""
  );
  const [words, setWords] = React.useState([]);
  const [sideCount, setSideCount] = React.useState(4);
  const [sideSize, setSideSize] = React.useState(3);
  const [truncate, setTruncate] = React.useState(true);
  const [selectedLettegon, setSelectedLettegon] = React.useState(
    // "ACE|BDF|GIK|HJL"
    null
  );

  const textInputRef = React.createRef();

  const forceTruncate = sideCount >= sideTruncCap;

  const allLetters = [...words, letters]
    .map((w, i) => (i ? w.slice(1) : w))
    .join("");
  // console.log(letters, "allLetters", allLetters);
  const { lettegons, resultFraction } = createBoards({
    letters: allLetters,
    sideCount,
    sideSize,
    truncate: truncate || forceTruncate,
  });
  const truncated = resultFraction < 1;
  const isCompleted = lettegons.length && lettegons[0].complete;
  // console.log("?+", isCompleted)

  // const uns = _.uniqBy(lettegons, "id");
  // console.log("* ", lettegons, truncated);

  const getResultsCount = () => {
    // TODO style (mui icon?)
    const text =
      truncated &&
      `Your results were${
        !truncate ? " forcefully" : ""
      } capped to prevent performance lags from trying to calculate an exponentially large number of permutations.

The following represent as little as ${
        Math.round(resultFraction * 10000) / 100
      }% of valid permutations.`;

    return (
      <code>
        {lettegons.length} {truncated ? "capped" : ""} results{" "}
        {truncated ? <em title={text}>(?)</em> : ""}
        <br />
      </code>
    );
  };

  const addWord = () => {
    // TODO: add dictionary
    const isWordValid = letters.length >= 2;
    if (!isWordValid) return null;

    setWords([...words, letters]);
    if (isCompleted) {
      setLetters("");
      setMode("selection");
    } else {
      setLetters(letters.slice(-1));
      textInputRef.current.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.code.toLowerCase() === "enter") addWord();
  };

  const updateLetters = (e) => {
    let newLetters = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
    if (!newLetters && words.length) {
      newLetters = words[words.length - 1];
      const newWords = words.slice(0, -1);
      setWords(newWords);
    } else if (words.length && letters.length && !newLetters.startsWith(letters[0])) {
      // prevent tampering with first letter through selection overwrite
      return;
    }
    setLetters(newLetters);
  };

  const resumeEditing = () => {
    const lastWord = words[words.length - 1];
    setLetters(lastWord);
    setWords(words.slice(0, -1));
    setMode("generate");
  }
  
  return (
    <div className="App">
      <code>Sides / Lettegon: {sideCount} </code>
      <input
        onChange={(e) => setSideCount(Number(e.target.value))}
        type="range"
        id="sideCount"
        name="side count"
        min={MIN_SIDES}
        max={MAX_SIDES}
        value={sideCount}
      />
      <br />
      <code>Letters per side: {sideSize} </code>
      <input
        onChange={(e) => setSideSize(Number(e.target.value))}
        type="range"
        id="sideSize"
        name="side size"
        min={MIN_SIDE_SIZE}
        max={MAX_SIDE_SIZE}
        value={sideSize}
      />
      <br />
      <br />
      {sideCount * sideSize > 26 && (
        <code>
          Note: there aren't enough unique letters in the alphabet to fill a
          Lettegon with {sideCount} sides and {sideSize} letters per side...
          <br />
          <br />
        </code>
      )}
      <code>Cap results (for performance): </code>
      <input
        onChange={() => setTruncate(!truncate)}
        type="checkbox"
        id="truncate"
        name="truncate results"
        checked={truncate || forceTruncate}
        disabled={forceTruncate}
        title={forceTruncate ? forceTruncateTitle : ""}
      />
      <br />
      <br />
      <code>Generate LETTEGONs!</code>
      <br />
      {words.join(", ")}
      {mode !== "generate" && (
        <Button onClick={resumeEditing}>Edit</Button>
      )}
      <br />
      {/* <input
        onChange={(e) =>
          setLetters(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
        }
      /> */}
      {mode !== "generate" ? null : (
        <TextField
          inputRef={textInputRef}
          autoFocus={true}
          variant="standard"
          value={letters}
          onChange={updateLetters}
          onKeyPress={handleKeyPress}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton aria-label="add word" onClick={addWord} edge="end">
                  {isCompleted ? "✓" : "+"}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      )}

      <br />
      {getResultsCount()}
      <br />
      {mode === "selection" ? "Click to configure and play" : null}
      <div
        className="results"
        style={{
          display: "flex",
          flexWrap: "wrap",
          paddingTop: 32,
        }}
      >
        {lettegons.map(({ id, complete }, i) => (
          <Lettegon
            key={id}
            setSelectedLettegon={mode !== "selection" ? _.noop : setSelectedLettegon}
            letters={allLetters}
            // sideCount={sideCount}
            // sideSize={sideSize}
            id={id}
            complete={complete}
          />
        ))}
      </div>
      {/* ) : ( */}
      <Modal
        open={!!selectedLettegon}
        sx={{
          p: "12px",
          pb: "24px",
          background: "none",
          "& .lettegon": {
            overflow: "auto",
            maxHeight: "calc(100vh - 36px)",
          },
        }}
        onBackdropClick={() => setSelectedLettegon(null)}
      >
        {/* div for Modal to attach ref to, display contents to not interfere w/outside click */}
        <div style={{ display: "contents" }}>
          <Lettegon
            // setSelectedLettegon={setSelectedLettegon}
            editMode={true}
            letters={allLetters}
            // sideCount={sideCount}
            // sideSize={sideSize}
            id={selectedLettegon}
            complete={true}
          />
        </div>
      </Modal>
      {/* )} */}
    </div>
  );
}
