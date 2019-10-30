import * as React from "react";
import TextField, { TextFieldProps } from "@material-ui/core/TextField";
import { parseTime } from "./parse-time";
import { Select } from "../select";

type Props = {
  label: string;
  textFieldProps?: TextFieldProps;
};

export const TimeInput = (props: Props) => {
  const options;

  // TODO: try out select for time picking

  return (
    <Select label={props.label} />
    // <TextField
    //   label={props.label}
    //   {...props.textFieldProps}
    //   variant="outlined"
    //   fullWidth
    // />
  );
};
