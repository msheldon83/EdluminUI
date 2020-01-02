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
    The validation in the handler is specific and primitive in order to accomdate only
    handling US numbers. It will have to change to add support for more countries in the future
  */
  const handleBlur = React.useCallback(
    e => {
      const defaultBlur = () => {
        // Don't override regular use of onBlur
        if (typeof inputProps.onBlur === "function") {
          inputProps.onBlur(e);
        }
      };

      if (!value) {
        defaultBlur();
        return;
      }

      const matchedValues = value.match(/\d+/g);

      if (matchedValues === null) {
        defaultBlur();
        return;
      }

      const number = matchedValues.map(Number).join("");

      if (number.length === 10) {
        onValidPhoneNumber(formatNumber(number));
      }

      defaultBlur();
    },
    [value, onValidPhoneNumber, inputProps]
  );

  // Only allow valid characters
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const INVALID_CHARACTERS = e.metaKey ? /\\/g : /[a-z]/gi;

    const isValid = e.key.length > 1 || !INVALID_CHARACTERS.test(e.key);

    if (isValid) {
      return true;
    }

    e.stopPropagation();
    e.preventDefault();

    return false;
  };

  return (
    <Input
      {...inputProps}
      value={value}
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
