import * as React from "react";
import { FormikContext, useFormikContext } from "formik";
import { usePrevious } from "hooks";

export type FormikWatcher<ValuesT> = (
  prev: ValuesT,
  next: ValuesT,
  formik: FormikContext<ValuesT>
) => unknown;
export function useFormikValuesWatcher<ValuesT>(
  onChange: FormikWatcher<ValuesT>
) {
  const formik = useFormikContext<ValuesT>();
  const cur = formik.values;
  const prev = usePrevious(formik.values);
  React.useEffect(() => {
    if (prev && cur !== prev) {
      onChange(prev, cur, formik);
    }
  }, [cur, prev, onChange, formik]);
}

export function FormikValuesWatcher<ValuesT>(props: {
  onChange: FormikWatcher<ValuesT>;
}) {
  useFormikValuesWatcher(props.onChange);
  return <></>;
}
