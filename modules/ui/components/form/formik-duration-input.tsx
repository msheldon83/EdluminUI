import * as React from "react";
import { useTranslation } from "react-i18next";
import { useField, useFormikContext } from "formik";
import { DurationInput, Props as DurationInputProps } from "./duration-input";

type Props = Omit<
  DurationInputProps,
  "name" | "onChange" | "value" | "inputStatus"
> & {
  name: string;
  inputStatus?:
    | "warning"
    | "error"
    | "success"
    | "default"
    | "formik"
    | undefined
    | null;
  alwaysTouched?: boolean;
};

export const FormikDurationInput: React.FC<Props> = props => {
  const [field, meta, helpers] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();
  const { t } = useTranslation();

  const placeholder = props.placeholder ?? t("hh:mm");
  const inputStatus =
    props.inputStatus == "formik"
      ? meta.error
        ? "error"
        : "success"
      : props.inputStatus;
  const validationMessage =
    props.validationMessage ?? props.inputStatus == "formik"
      ? meta.error
      : undefined;

  React.useEffect(
    () => {
      if (props.alwaysTouched && !meta.touched) helpers.setTouched(true);
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [meta.touched]
  );

  return (
    <DurationInput
      {...props}
      validationMessage={validationMessage}
      inputStatus={inputStatus}
      value={field?.value?.toString() ?? ""}
      onChange={(value: number) => setFieldValue(props.name, value)}
      placeholder={placeholder}
    />
  );
};
