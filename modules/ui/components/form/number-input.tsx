import * as React from "react";
import { useTheme } from "@material-ui/core/styles";
import { Input, InputProps } from "./input";
import { numberRegExpWithMaxLength } from "../../../helpers/regexp";

export type NumberInputProps = Omit<
  InputProps,
  "value" | "onChange" | "maxLength"
> & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  maxLengthBeforeDecimal?: number;
  maxLengthAfterDecimal?: number;
};

export const NumberInput = (props: NumberInputProps) => {
  const {
    value,
    onChange,
    maxLengthBeforeDecimal,
    maxLengthAfterDecimal,
    ...inputProps
  } = props;

  const theme = useTheme();

  const numberRegExp = numberRegExpWithMaxLength(
    maxLengthBeforeDecimal,
    maxLengthAfterDecimal
  );

  return (
    <Input
      {...inputProps}
      style={{ fontSize: theme.typography.pxToRem(14) }}
      value={value ?? ""}
      onChange={e => {
        // if value is not blank, then test the regex
        if (e.target.value === "" || numberRegExp.test(e.target.value)) {
          // Make sure value is always a number
          onChange(e.target.value !== "" ? +e.target.value : undefined);
        }
      }}
    />
  );
};
