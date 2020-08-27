import * as React from "react";
import { useField, useFormikContext } from "formik";
import { TimeInput, TimeInputProps } from "./time-input";
import { useState } from "react";
import { convertStringToDate } from "helpers/date";
import { parseISO, getHours, getMinutes } from "date-fns";

type Props = Omit<
  TimeInputProps,
  "name" | "label" | "onChange" | "onValidTime" | "inputStatus"
> & {
  name: string;
  label?: string;
  date?: Date;
  className?: string;
  placeHolder?: string;
  inputStatus:
    | "warning"
    | "error"
    | "success"
    | "default"
    | "formik"
    | null
    | undefined;
};

export const FormikTimeInput: React.FC<Props> = ({
  validationMessage,
  inputStatus,
  ...props
}) => {
  const [field, meta, helpers] = useField(props.name);

  const [time, setTime] = useState(
    field.value ? convertStringToDate(field.value)?.toISOString() : undefined
  );

  React.useEffect(() => setTime(field.value), [setTime, field.value]);

  const derivedError = meta.touched
    ? meta.error == "Required" && time != undefined
      ? undefined
      : meta.error
    : undefined;

  return (
    <TimeInput
      label={props.label || ""}
      className={props.className}
      placeHolder={props.placeHolder}
      {...props}
      inputStatus={
        inputStatus == "formik"
          ? derivedError
            ? "error"
            : "default"
          : inputStatus
      }
      validationMessage={
        validationMessage ??
        (inputStatus == "formik" ? derivedError : undefined)
      }
      value={time}
      onChange={(v: string | undefined) => {
        setTime(v);
        if (!v) {
          helpers.setValue(undefined);
        }
      }}
      onBlur={field.onBlur}
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
        helpers.setValue(time);
      }}
    />
  );
};
