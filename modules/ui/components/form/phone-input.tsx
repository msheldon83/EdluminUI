import * as React from "react";
import take from "lodash-es/take";
import takeRight from "lodash-es/takeRight";
import { Input, InputProps } from "./input";

type PhoneInputProps = InputProps & {
  value?: string;
  onValidPhoneNumber?: (value: string) => void;
};

export const PhoneInput = (props: PhoneInputProps) => {
  const { onValidPhoneNumber = () => {}, value, ...inputProps } = props;

  /*
    - pull out all numbers
    - combine all values of that array into a single string
  */
  const strippedValue = value?.match(/\d+/g)?.join("") ?? "";

  /*
    The validation in the handler is specific and primitive in order to accomdate only
    handling US numbers. It will have to change to add support for more countries in the future
  */
  const handleBlur = React.useCallback(
    e => {
      if (strippedValue.length === 10) {
        onValidPhoneNumber(formatNumber(strippedValue));
      }

      // Don't override regular use of onBlur
      if (typeof inputProps.onBlur === "function") {
        inputProps.onBlur(e);
      }
    },
    [strippedValue, onValidPhoneNumber, inputProps]
  );

  // Only allow valid characters
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      const INVALID_CHARACTERS = e.metaKey ? /\\/g : /[a-z]/gi;
      const isValid = e.key.length > 1 || !INVALID_CHARACTERS.test(e.key);
      const isNumber = !isNaN(Number(e.key));

      /*
      If it's at 10 valid digits, it's not a special key and the meta key isn't pressed.
      This allows for things like select all to still be available to press.
        - is anumber
        - has 10 characters
        - key pressed is not alpha-numeric
        - meta key isn't pressed
    */
      const atMaxLength =
        isNumber &&
        strippedValue.length === 10 &&
        e.key.length === 1 &&
        !e.metaKey;

      if (isValid && !atMaxLength) {
        return true;
      }

      e.stopPropagation();
      e.preventDefault();

      return false;
    },
    [strippedValue]
  );

  return (
    <Input
      {...inputProps}
      value={value === "undefined" ? "" : value}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
};

const formatNumber = (number: string) => {
  const [_, areaCode, firstThree, lastFour] = /^(\d{3})(\d{3})(\d{4})$/.exec(
    number
  ) as Array<string>;

  return `${areaCode} ${firstThree}-${lastFour}`;
};
