import { useField, useFormikContext } from "formik";
import * as React from "react";
import {
  SelectProps,
  SelectNew,
  OptionType,
} from "ui/components/form/select-new";

type Props = Required<
  Pick<SelectProps<false>, "options" | "name" | "withResetValue">
>;

export const FormikSelect: React.FC<Props> = props => {
  const [field, meta] = useField(props.name);
  const { setFieldValue } = useFormikContext<any>();

  return (
    <SelectNew
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
