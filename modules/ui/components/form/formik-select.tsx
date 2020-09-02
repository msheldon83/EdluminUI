import { useField, useFormikContext } from "formik";
import * as React from "react";
import { SelectProps, Select, OptionType } from "ui/components/form/select";

type Props = Required<
  Pick<SelectProps<false>, "options" | "name" | "withResetValue">
>;

export const FormikSelect: React.FC<Props> = props => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();

  return (
    <Select
      {...field}
      {...props}
      value={{
        value: field.value ?? "",
        label:
          props.options.find((op: OptionType) => op.value === field.value)
            ?.label || "",
      }}
      onChange={v => setFieldValue(props.name, (v as any).value)}
      multiple={false}
    />
  );
};
