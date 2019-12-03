import * as React from "react";
import { useField, useFormikContext } from "formik";
import { TimeInput, Props as TimeInputProps } from "./time-input";
import { useState } from "react";
import { convertStringToDate } from "helpers/date";

type Props = Omit<
  TimeInputProps,
  "name" | "label" | "onChange" | "onValidTime"
> & {
  name: string;
  label?: string;
};

export const FormikTimeInput: React.FC<Props> = props => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();

  const [time, setTime] = useState(
    field.value ? convertStringToDate(field.value)?.toISOString() : undefined
  );

  return (
    <TimeInput
      label={props.label || ""}
      name={props.name}
      {...props}
      value={time}
      onChange={v => setTime(v)}
      onValidTime={v => {
        setTime(v);
        setFieldValue(props.name, v);
      }}
    />
  );
};
