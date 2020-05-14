// Copied from https://www.freecodecamp.org/news/how-to-create-a-hex2rgb-color-converter-ce32d32afd1f/
// and modified to add in an optional alpha channel
export const hexToRgb = (hex: string, alpha?: number) => {
  let x = [];
  hex = hex.replace("#", "");
  if (hex.length != 6) {
    hex = modifyHex(hex);
  }
  x.push(parseInt(hex.slice(0, 2), 16));
  x.push(parseInt(hex.slice(2, 4), 16));
  x.push(parseInt(hex.slice(4, 6), 16));

  if (alpha) {
    return `rgba(${x},${alpha})`;
  }

  return `rgb(${x})`;
};

const modifyHex = (hex: string) => {
  if (hex.length == 4) {
    hex = hex.replace("#", "");
  }
  if (hex.length == 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  return hex;
};
