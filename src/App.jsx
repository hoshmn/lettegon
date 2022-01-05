import React from "react";
import createBoards from "./createBoards";
import Lettegon from "./Lettegon";
import Modal from "@mui/material/Modal";
import "./styles.css";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import _ from "lodash";
import { MAX_SIDE_SIZE, MAX_SIDES, MIN_SIDES, MIN_SIDE_SIZE } from "./consts";
import { getAllLetters, isValidConfig } from "./utils";
import PlayLettegon from "./PlayLettegon";
import WordBank from "./WordBank";

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
      <PlayLettegon config={config.toUpperCase()} solution={solution} />
    )
  // } else if (location.search) {
    // window.location.pathname = ""; // clear invalid
    // location.search = ""
  }
  
  const [mode, setMode] = React.useState("generate"); // selection, play, edit?
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

  const allLetters = getAllLetters({ words, letters });
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
      <WordBank
        words={words}
        letters={letters}
        textInputRef={textInputRef}
        mode={mode}
        setLetters={setLetters}
        setWords={setWords}
        setMode={setMode}
        isCompleted={isCompleted}
      />
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
            setSelectedLettegon={mode === "selection" && setSelectedLettegon}
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
