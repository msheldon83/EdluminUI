import * as React from "react";
import { useTheme } from "@material-ui/core/styles";
import { Input, InputProps } from "./input";

export type NumberInputProps = Omit<InputProps, "value" | "onChange"> & {
  value: number | undefined;
  onChange: (value: number | undefined) => void;
  maxLength?: number;
};

export const NumberInput = (props: NumberInputProps) => {
  const { value, onChange, maxLength, ...inputProps } = props;

  const theme = useTheme();

  return (
    <Input
      {...inputProps}
      style={{ fontSize: theme.typography.pxToRem(14) }}
      value={value?.toString() ?? ""}
      onChange={e => {
        const numberRegex = /^[0-9\b]+$/;

        if (maxLength && e.target.value.length > maxLength) {
          return;
        }

        // if value is not blank, then test the regex
        if (e.target.value === "" || numberRegex.test(e.target.value)) {
          // Make sure value is always a number
          onChange(e.target.value !== "" ? +e.target.value : undefined);
        }
      }}
    />
  );
};
