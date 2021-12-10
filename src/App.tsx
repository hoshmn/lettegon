import React from "react";
import createBoards from "./createBoards";
import "./styles.css";
import _ from "lodash";

export default function App() {
  const [letters, setLetters] = React.useState("");
  const [sideCount, setSideCount] = React.useState(4);
  const [sideSize, setSideSize] = React.useState(3);

  // const [lettegons, setLettegons] = React.useState([])
  const boards = createBoards({ letters, sideCount, sideSize });

  console.log("* ", boards);

  const uns = _.uniqBy(boards, "id");
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
        max="6"
        value={sideSize}
      />
      <br />
      <code>Generate LETTEGONs!!!!</code>
      <br />
      <input onChange={(e) => setLetters(e.target.value)} />
      <h2>
        boards: {boards.length} ({uns.length})
      </h2>
      {boards.map((b) => (
        <div style={{ background: b.complete ? "yellow" : "none" }}>
          {b.id.replaceAll("|", " . ")}
        </div>
      ))}
    </div>
  );
}
