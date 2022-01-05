import { MAX_SIDES, MAX_SIDE_SIZE, MIN_SIDES, MIN_SIDE_SIZE } from "./consts";
import _ from "lodash";

const encryptionGenerator = (salt) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);

  return (text) =>
    text.split("").map(textToChars).map(applySaltToChar).map(byteHex).join("");
};
export const encrypter = encryptionGenerator("");

const decryptionGenerator = (salt) => {
  const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
  const applySaltToChar = (code) =>
    textToChars(salt).reduce((a, b) => a ^ b, code);
  return (encoded) =>
    encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");
};
export const decrypter = decryptionGenerator("");

export const isValidConfig = (config) => {
  if (!config) return false;
  try {
    const letters = config.replaceAll("|", "").toUpperCase();
    const inappropriateChars = letters.replaceAll(/[A-Z]/g, "");
    if (inappropriateChars.length) return false;

    if (letters.length !== _.uniq(letters).length) return false;

    const configArr = config.split("|");
    const sides = configArr.length;
    if (sides > MAX_SIDES || sides < MIN_SIDES) return false;

    const sideSizes = configArr.map((s) => s.length);
    const [side1] = sideSizes;
    return (
      _.uniq(sideSizes).length === 1 &&
      side1 <= MAX_SIDE_SIZE &&
      side1 >= MIN_SIDE_SIZE
    );
  } catch (error) {
    return false;
  }
};
