import { Box } from "@mui/material";
import React from "react";
import _ from "lodash";
import Lettegon from "./Lettegon";
import WordBank from "./WordBank";
import { getAllLetters, isValidPlay } from "./utils";

export default function PlayLettegon({ config, solution }) {
  // const [mode, setMode] = React.useState("generate");
  const [letters, setLetters] = React.useState(
    // "ABCDEFGHIJKL"
    ""
  );
  const [words, setWords] = React.useState([]);
  const textInputRef = React.createRef();

  const addLetter = letter => {
    if (letters.slice(-1) === letter) {
      // remove last letter
      setLetters(letters.slice(0, -1))
      return;
    } else if (isValidPlay({ letters: letters + letter, config})) {
      // play if valid
      setLetters(letters + letter)
    }
  }

  const isSolved = _.uniq(words.join("")).length === config.replaceAll("|", "").length;

  const allLetters = getAllLetters({ words, letters });
  return (
    <Box>
      <WordBank
        words={words}
        letters={letters}
        textInputRef={textInputRef}
        mode={isSolved ? "selection" : "play"}
        setLetters={setLetters}
        setWords={setWords}
        // setMode={setMode}
        isCompleted={false}
        // playMode={true}
        config={config}
      />
      <Lettegon
        // setSelectedLettegon={setSelectedLettegon}
        playMode={true}
        onClickLetter={addLetter}
        letters={allLetters}
        id={config}
        complete={true}
      />
      {isSolved && "CONGRATULATIONS!"}
    </Box>
  );
}
