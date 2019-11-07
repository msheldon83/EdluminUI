import * as React from "react";
import {
  isIso,
  humanizeTimeStamp,
  parseTimeFromString,
  timeStampToIso,
  isoToTimestamp,
} from "../../../helpers/time";
import { Input } from "./input";

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onValidTime: (value: string) => void;
  earliestTime?: string;
};

export const TimeInput = (props: Props) => {
  //2019-11-04T06:00:00.000Z/
  const { earliestTime, onValidTime, label, value = "", onChange } = props;

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
      value={parsedValue}
      onChange={event => onChange(event.target.value)}
      onBlur={handleBlur}
    />
  );
};
