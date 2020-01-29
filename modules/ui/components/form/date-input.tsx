import isValid from "date-fns/isValid";
import * as React from "react";
import createDate from "sugar/date/create";
import { formatDateIfPossible } from "../../../helpers/date";
import { DEFAULT_DATE_FORMAT } from "./date-picker";
import { Input } from "./input";

type DateInputProps = {
  label: string;
  value?: Date | string;
  onChange: (date: string) => void;
  onValidDate: (date: Date) => void;
  onFocus?: () => void;
  onBlur?: () => void;
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
  } = props;

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleOnBlur = () => {
    let date = createDate(value);

    if (isValid(date)) {
      onValidDate(date);
    } else {
      date = value;
    }

    onBlur();
    onChange(date);
  };

  const formattedValue = formatDateIfPossible(value, dateFormat);

  return (
    <Input
      label={label}
      value={formattedValue}
      onChange={handleOnChange}
      onBlur={handleOnBlur}
      onFocus={onFocus}
      ref={ref}
      endAdornment={endAdornment}
    />
  );
});
