export const phoneRegExp = /^(1)?[-. ]?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

export const numberRegExp = /^\s*[+-]?(\d+|\.\d+|\d+\.\d+|\d+\.)(e[+-]?\d+)?\s*$/;

export const numberRegExpWithMaxLength = (
  maxLengthBeforeDecimal?: number,
  maxLengthAfterDecimal?: number
) => {
  const before = maxLengthBeforeDecimal ?? "";
  const after = maxLengthAfterDecimal ?? "";

  return new RegExp(
    `^\\s*[+-]?(\\d{1,${before}}|\\.\\d{1,${before}}|\\d{1,${before}}\\.\\d{1,${after}}|\\d{1,${after}}\\.)(e[+-]?\\d+)?\\s*$`
  );
};
