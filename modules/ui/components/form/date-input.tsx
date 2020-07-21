import isValid from "date-fns/isValid";
import * as React from "react";
import createDate from "sugar/date/create";
import { formatDateIfPossible } from "../../../helpers/date";
import { DEFAULT_DATE_FORMAT } from "./date-picker";
import { Input, InputProps } from "./input";

type InputPropsExtendable = Omit<InputProps, "onChange" | "value">;

type DateInputProps = InputPropsExtendable & {
  value?: Date | string;
  onChange: (date: string) => void;
  onValidDate: (date: Date) => void;
  dateFormat?: string;
  endAdornment?: React.ReactNode;
};

export const DateInput = React.forwardRef((props: DateInputProps, ref) => {
  const {
    value = "",
    onValidDate,
    onChange,
    onBlur = () => {},
    dateFormat = DEFAULT_DATE_FORMAT,
    ...inputProps
  } = props;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleOnBlur = (
    e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    let date = createDate(value);

    onChange(date);
    onBlur(e);

    if (isValid(date)) {
      onValidDate(date);
    } else {
      date = value;
    }
  };

  const formattedValue = formatDateIfPossible(value, dateFormat);

  return (
    <Input
      {...inputProps}
      value={formattedValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      ref={ref}
    />
  );
});
