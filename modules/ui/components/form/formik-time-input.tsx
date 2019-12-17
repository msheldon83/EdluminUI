import * as React from "react";
import { useField, useFormikContext } from "formik";
import { TimeInput, Props as TimeInputProps } from "./time-input";
import { useState } from "react";
import { convertStringToDate } from "helpers/date";
import { parseISO, getHours, getMinutes } from "date-fns";

type Props = Omit<
  TimeInputProps,
  "name" | "label" | "onChange" | "onValidTime"
> & {
  name: string;
  label?: string;
  date?: Date;
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
      onChange={v => {
        setTime(v);
        if (!v) {
          setFieldValue(props.name, undefined);
        }
      }}
      onValidTime={v => {
        let time = v;
        if (props.date) {
          const vAsDate = parseISO(v);
          const date = new Date(props.date);
          date.setHours(getHours(vAsDate));
          date.setMinutes(getMinutes(vAsDate));
          date.setSeconds(0);
          date.setMilliseconds(0);
          time = date.toISOString();
        }

        setTime(time);
        setFieldValue(props.name, time);
      }}
    />
  );
};
