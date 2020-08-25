import * as React from "react";
import { useField, useFormikContext } from "formik";
import { TimeInput, TimeInputProps } from "./time-input";
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
  className?: string;
  placeHolder?: string;
};

export const FormikTimeInput: React.FC<Props> = ({
  validationMessage,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();

  const [time, setTime] = useState(
    field.value ? convertStringToDate(field.value)?.toISOString() : undefined
  );

  React.useEffect(() => setTime(field.value), [setTime, field.value]);

  return (
    <TimeInput
      label={props.label || ""}
      className={props.className}
      placeHolder={props.placeHolder}
      {...props}
      validationMessage={
        validationMessage ?? (meta.touched ? meta.error : undefined)
      }
      value={time}
      onChange={(v: string | undefined) => {
        setTime(v);
        if (!v) {
          setFieldValue(props.name, undefined);
        }
      }}
      onBlur={() => helpers.setTouched(true)}
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
