import * as React from "react";
import {
  isIso,
  humanizeTimeStamp,
  parseTimeFromString,
  timeStampToIso,
  isoToTimestamp,
} from "../../../helpers/time";
import { Input } from "./input";

export type Props = {
  label: string;
  value?: string;
  name?: string;
  onChange: (value: string) => void;
  onValidTime: (value: string) => void;
  earliestTime?: string;
  ref?: React.Ref<any>;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string | undefined;
  disabled?: boolean;
  className?: string;
  placeHolder?: string;
};

export const TimeInput = React.forwardRef((props: Props, ref) => {
  //2019-11-04T06:00:00.000Z/
  const {
    earliestTime,
    onValidTime,
    label,
    value = "",
    onChange,
    name,
    inputStatus = "default",
    validationMessage,
    disabled,
    className,
    placeHolder,
  } = props;

  const parsedValue = isIso(value)
    ? humanizeTimeStamp(isoToTimestamp(value))
    : value;

  const handleBlur = React.useCallback(
    event => {
      // It's not a valid time if there is no input
      if (!parsedValue) {
        return;
      }

      onValidTime(
        timeStampToIso(parseTimeFromString(event.target.value, earliestTime))
      );
    },
    [earliestTime, onValidTime, parsedValue]
  );

  return (
    <Input
      label={label}
      className={className}
      name={name}
      value={parsedValue}
      onChange={event => onChange(event.target.value)}
      onBlur={handleBlur}
      inputRef={ref}
      inputStatus={inputStatus}
      disabled={disabled}
      validationMessage={validationMessage}
      placeholder={placeHolder}
    />
  );
});
