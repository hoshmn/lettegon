import React from "react";
import createBoards from "./createBoards";
import "./styles.css";
import _ from "lodash";

const sideTruncCap = 6;

export default function App() {
  const [letters, setLetters] = React.useState("");
  const [sideCount, setSideCount] = React.useState(4);
  const [sideSize, setSideSize] = React.useState(3);
  const [truncate, setTruncate] = React.useState(false);

  const forceTruncate = sideCount >= sideTruncCap;

  const { lettegons, resultFraction } = createBoards({
    letters,
    sideCount,
    sideSize,
    truncate: truncate || forceTruncate
  });
  const truncated = resultFraction < 1;

  // const uns = _.uniqBy(lettegons, "id");
  // console.log("* ", uns.length === lettegons.length);

  return (
    <div className="App">
      Side count: {sideCount}{" "}
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
      Letters per side: {sideSize}{" "}
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
      Cap results (for performance):{" "}
      <input
        onChange={() => setTruncate(!truncate)}
        type="checkbox"
        id="truncate"
        name="truncate results"
        checked={truncate || forceTruncate}
        disabled={forceTruncate}
      />
      <br />
      <br />
      {sideCount * sideSize > 28 && (
        <strong>
          there aren't enough unique letters in the alphabet to complete a
          lettegon.
        </strong>
      )}
      <br />
      <code>Generate LETTEGONs!!!!</code>
      <br />
      <input onChange={(e) => setLetters(e.target.value.toUpperCase())} />
      <br />
      <h2>lettegons: {lettegons.length}</h2>
      {truncated && (
        <code>
          your results were{!truncate && " forcefully"} capped to prevent
          performance lags from trying to calculate an exponentially large
          number of permutations.
          <br />
          <br />
          the following represent about{" "}
          {Math.round(resultFraction * 10000) / 100}% of valid permutations.
          <br />
          <br />
        </code>
      )}
      {lettegons.map((b) => (
        <div
          key={b.id}
          style={{
            fontWeight: 100,
            background: b.complete ? "yellow" : "none"
          }}
        >
          {b.id.replaceAll("|", " . ")}
        </div>
      ))}
    </div>
  );
}
