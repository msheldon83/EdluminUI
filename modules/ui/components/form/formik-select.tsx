import { useField, useFormikContext } from "formik";
import * as React from "react";
import { Props as SelectProps, Select } from "ui/components/form/select";

type Props = Required<Pick<SelectProps, "options" | "name" | "isClearable">>;

export const FormikSelect: React.FC<Props> = props => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();

  return (
    <Select
      {...field}
      {...props}
      value={{
        value: field.value,
        label: props.options.find(op => op.value === field.value)?.label || "",
      }}
      onChange={v => setFieldValue(props.name, (v as any).value)}
    />
  );
};
