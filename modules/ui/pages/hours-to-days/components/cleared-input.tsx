import * as React from "react";
import { useField } from "formik";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { Input } from "ui/components/form/input";

type Props = {
  name: string;
  className: string;
};

export const ClearedInput: React.FC<Props> = ({ name, className }) => {
  const [field, meta] = useField(name);
  return (
    <Input
      InputComponent={FormTextField}
      inputComponentProps={{
        name: name,
        id: name,
        fullWidth: true,
        className: className,
      }}
      value={field.value ?? ""}
    />
  );
};
