import {
  Box,
  Button,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import React from "react";
import _ from "lodash";
import { isValidPlay } from "./utils";

export default function WordBank({
  words,
  letters,
  textInputRef,
  mode,
  setLetters,
  setWords,
  setMode = _.noop,
  isCompleted,
  config,
}) {
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
      // deleted first letter, so pull out last word
      newLetters = words[words.length - 1];
      const newWords = words.slice(0, -1);
      setWords(newWords);
    } else if (
      words.length &&
      letters.length &&
      !newLetters.startsWith(letters[0])
    ) {
      // prevent tampering with first letter through selection overwrite
      return;
    } else if (mode === "play" && !isValidPlay({ letters: newLetters, config })) {
      // don't allow player to add letters not possible given config
      return;
    }
    setLetters(newLetters);
  };

  const resumeEditing = () => {
    const lastWord = words[words.length - 1];
    setLetters(lastWord);
    setWords(words.slice(0, -1));
    setMode("generate");
  };

  return (
    <Box>
      {words.join(", ")}
      {mode === "selection" && <Button onClick={resumeEditing}>Edit</Button>}
      <br />
      {mode === "selection" ? null : (
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
    </Box>
  );
}
