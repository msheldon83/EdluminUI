import { Isomorphism } from "@atomic-object/lenses";
import { FormikHelpers } from "formik";
import * as yup from "yup";

export const IDENTITY_ISO: Isomorphism<any, any> = {
  from: (a: any) => a,
  to: (b: any) => b,
};

export type SubmitFn<Values> = (
  values: Values,
  formikHelpers: FormikHelpers<Values>
) => void;
export type SchemaBuilder<
  TFormData extends object
> = (arg: {}) => yup.ObjectSchema<TFormData>;

export type RedirectState = { key: "REDIRECT"; to: string };
