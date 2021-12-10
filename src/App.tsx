import React from "react";
import createBoards from "./createBoards";
import "./styles.css";
import _ from "lodash";

export default function App() {
  const [letters, setLetters] = React.useState("");
  const [sideCount, setSideCount] = React.useState(4);
  const [sideSize, setSideSize] = React.useState(3);

  // TODO make truncation an option
  // const [lettegons, setLettegons] = React.useState([])
  const { lettegons, truncated } = createBoards({
    letters,
    sideCount,
    sideSize
  });

  console.log("* ", lettegons);

  const uns = _.uniqBy(lettegons, "id");
  return (
    <div className="App">
      Side count: {sideCount}{" "}
      <input
        onChange={(e) => setSideCount(Number(e.target.value))}
        type="range"
        id="sideCount"
        name="side count"
        min="3"
        max="5"
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
      <code>Generate LETTEGONs!!!!</code>
      <br />
      {truncated && <span>truncated</span>}
      <br />
      <input onChange={(e) => setLetters(e.target.value)} />
      <h2>
        lettegons: {lettegons.length} ({uns.length})
      </h2>
      {lettegons.map((b) => (
        <div key={b.id} style={{ background: b.complete ? "yellow" : "none" }}>
          {b.id.replaceAll("|", " . ")}
        </div>
      ))}
    </div>
  );
}
