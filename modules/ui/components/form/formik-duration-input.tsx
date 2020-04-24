import * as React from "react";
import { useTranslation } from "react-i18next";
import { useField, useFormikContext } from "formik";
import { DurationInput, Props as DurationInputProps } from "./duration-input";

type Props = Omit<DurationInputProps, "name" | "onChange" | "value"> & {
  name: string;
};

export const FormikDurationInput: React.FC<Props> = props => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();
  const { t } = useTranslation();

  const placeholder = props.placeholder ?? t("hh:mm");

  return (
    <DurationInput
      {...props}
      value={field?.value?.toString() ?? ""}
      onChange={(value: number) => setFieldValue(props.name, value)}
      placeholder={placeholder}
    />
  );
};
