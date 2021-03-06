import React from "react";
import createBoards from "./createBoards";
import Lettegon from "./Lettegon";
import Modal from "@mui/material/Modal";
import "./styles.css";
// import _ from "lodash";

const sideTruncCap = 6;
const forceTruncateTitle = `results automatically capped for Lettegons with ${sideTruncCap} or more sides`;

export default function App() {
  const [letters, setLetters] = React.useState(
    // "ABCDEFGHIJKL"
    ""
  );
  const [sideCount, setSideCount] = React.useState(4);
  const [sideSize, setSideSize] = React.useState(3);
  const [truncate, setTruncate] = React.useState(true);
  const [selectedLettegon, setSelectedLettegon] = React.useState(
    // "ACE|BDF|GIK|HJL"
    null
  );

  const forceTruncate = sideCount >= sideTruncCap;

  const { lettegons, resultFraction } = createBoards({
    letters,
    sideCount,
    sideSize,
    truncate: truncate || forceTruncate,
  });
  const truncated = resultFraction < 1;

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
        min="3"
        max="8"
        value={sideCount}
      />
      <br />
      <code>Letters per side: {sideSize} </code>
      <input
        onChange={(e) => setSideSize(Number(e.target.value))}
        type="range"
        id="sideSize"
        name="side size"
        min="1"
        max="5"
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
      <input
        onChange={(e) =>
          setLetters(e.target.value.toUpperCase().replace(/[^A-Z]/g, ""))
        }
      />
      <br />
      {getResultsCount()}
      {/* {!selectedLettegon ? ( */}
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
            setSelectedLettegon={setSelectedLettegon}
            letters={letters}
            sideCount={sideCount}
            sideSize={sideSize}
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
            letters={letters}
            sideCount={sideCount}
            sideSize={sideSize}
            id={selectedLettegon}
            complete={true}
          />
        </div>
      </Modal>
      {/* )} */}
    </div>
  );
}
