import config from "../../../config";

export default function noteValidator(
  rowId: string,
  value: string,
  setTemporaryErrors: (error: string[]) => void
): string {
  if (value.length > config.maxNoteLengthChars) {
    navigator.clipboard.writeText(value);
    setTemporaryErrors([
      `Note too long. Copied note to clipboard and truncated to first ${config.maxNoteLengthChars} characters in table`,
    ]);
    return value.slice(0, config.maxNoteLengthChars);
  }
  return value;
}
