import * as React from "react";
import { initial } from "lodash-es";
import TextField from "@material-ui/core/TextField";
import {
  isIso,
  humanizeTimeStamp,
  parseTimeFromString,
  timeStampToIso,
  isoToTimestamp,
} from "../../../helpers/time";

type Props = {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  onValidTime: (value: string) => void;
};

export const TimeInput = (props: Props) => {
  const guarenteedValue = props.value || "";

  const value = isIso(guarenteedValue)
    ? humanizeTimeStamp(isoToTimestamp(guarenteedValue))
    : guarenteedValue;

  return (
    <TextField
      label={props.label}
      variant="outlined"
      value={value}
      onChange={event => props.onChange(event.target.value)}
      onBlur={event => {
        // It's not a valid time if there is no input
        if (!value) {
          return;
        }

        props.onValidTime(
          timeStampToIso(parseTimeFromString(event.target.value))
        );
      }}
    />
  );
};
