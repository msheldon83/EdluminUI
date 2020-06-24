import * as React from "react";
import { Input, InputProps } from "./input";

export type DecimalInputProps = Omit<InputProps, "value" | "onChange"> & {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  maxLength?: number;
};

export const DecimalInput = (props: DecimalInputProps) => {
  const { value, onChange, maxLength, ...inputProps } = props;

  return (
    <Input
      {...inputProps}
      value={value?.toString() ?? ""}
      onChange={e => {
        const numberRegex = /^([0-9](\.?[0-9]*)?)+$/;
        if (maxLength && e.target.value.length > maxLength) {
          return;
        }

        // if value is not blank, then test the regex
        if (e.target.value === "" || numberRegex.test(e.target.value)) {
          onChange(e.target.value !== "" ? e.target.value : undefined);
        }
      }}
    />
  );
};
