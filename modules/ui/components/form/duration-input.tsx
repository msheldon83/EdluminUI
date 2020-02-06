import * as React from "react";
import { Input, InputProps } from "./input";

export type Props = Omit<InputProps, "onChange" | "onBlur"> & {
  label: string;
  value?: string;
  name?: string;
  onChange: (value: number) => void;
  ref?: React.Ref<any>;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string | undefined;
  disabled?: boolean;
  helperMessage?: string;
};

export const DurationInput = React.forwardRef((props: Props, ref) => {
  const {
    label,
    value = "",
    onChange,
    name,
    inputStatus = "default",
    validationMessage,
    disabled,
    helperMessage,
  } = props;

  // This is a uncontrolled ocmponent because of how the the formatting needs to happen
  const [internalValue, setInternalValue] = React.useState(
    formatDuration(value)
  );

  const handleBlur = React.useCallback(
    event => {
      // Always send out a number
      onChange(internalValue ? unformatDuration(internalValue) : 0);

      // Internally, the value can be a number or a formatted duration
      setInternalValue(formatDuration(internalValue));
    },
    [internalValue, onChange]
  );

  return (
    <Input
      label={label}
      name={name}
      value={internalValue}
      onChange={event => setInternalValue(event.target.value)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      inputRef={ref}
      inputStatus={inputStatus}
      disabled={disabled}
      validationMessage={validationMessage || helperMessage}
    />
  );

});

// Only allow valid characters
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const VALID_CHARACTERS = /[0-9:]/gi;
  const isValid = e.key.length > 1 || VALID_CHARACTERS.test(e.key) || e.metaKey;

  if (isValid) {
    return true;
  }

  e.stopPropagation();
  e.preventDefault();

  return false;
};

// Deconstruct the formatted duration with as much protection as possible
const unformatDuration = (duration: string) => {
  if (!isFormattedDuration(duration)) {
    return parseInt(duration, 10);
  }

  const [hours, minutes] = duration.split(":").map(value => {
    const parsedValue = parseInt(value, 10);

    return isNaN(parsedValue) ? 0 : parsedValue;
  });

  return hours * 60 + minutes;
};

/*
  This component assumes that a formatted duration just has a ":" because only numeric characters
  are allowed to be typed into the input and the formatter adds the ":"
*/
const isFormattedDuration = (duration: string) => duration.includes(":");

const formatDuration = (rawDuration: string) => {
  const duration: string = rawDuration.toString();

  const totalMinutes = isFormattedDuration(duration)
    ? unformatDuration(duration)
    : parseInt(duration, 10);

  /*
    If for some reason some bad characters got into the string, the consumer should
    show an error message and this component shouldn't try to format it
  */
  if (isNaN(totalMinutes)) {
    return duration;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
};
