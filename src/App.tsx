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
      <h1>Hello CodeSandbox</h1>
      <h2>Start editing to see some magic happen!</h2>
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
