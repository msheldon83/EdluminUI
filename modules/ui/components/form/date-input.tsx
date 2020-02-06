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
    label,
    value = "",
    onValidDate,
    onChange,
    onFocus,
    endAdornment,
    onBlur = () => {},
    dateFormat = DEFAULT_DATE_FORMAT,
    ...inputProps
  } = props;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleOnBlur = (e: React.FocusEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    let date = createDate(value);

    if (isValid(date)) {
      onValidDate(date);
    } else {
      date = value;
    }

    onBlur(e);
    onChange(date);
  };

  const formattedValue = formatDateIfPossible(value, dateFormat);

  return (
    <Input
      {...inputProps}
      value={formattedValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      onFocus={onFocus}
      ref={ref}
      endAdornment={endAdornment}
    />
  );
});
