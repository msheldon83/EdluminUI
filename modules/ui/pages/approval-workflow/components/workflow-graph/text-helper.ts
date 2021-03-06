// Custom word break function since SVG doesn't support word breaks
export const breakLabel = (label: string, maxCharacters: number) => {
  const result = [] as string[];
  let splitLabel = [] as string[];

  if (label && label.includes(" ")) {
    splitLabel = label.split(" ");
  } else {
    return [label];
  }

  let lineCount = 0;
  let line = "";
  splitLabel.forEach((word, index) => {
    if (
      lineCount < maxCharacters &&
      lineCount + word.length + 1 < maxCharacters
    ) {
      line = line + " " + word;
      lineCount = lineCount + word.length + 1;
    } else {
      result.push(line + " ");
      line = word;
      lineCount = word.length;
    }
  });
  result.push(line);

  return result;
};
