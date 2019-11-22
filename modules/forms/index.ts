import ReactHookForm from "react-hook-form";
import { ValidationPayload, FieldError } from "react-hook-form/dist/types";

export type Register = ReturnType<typeof ReactHookForm>["register"];
export type SetValue = ReturnType<typeof ReactHookForm>["setValue"];
export type Errors = Partial<Record<string, FieldError>>;
export type TriggerValidation = (
  payload?:
    | ValidationPayload<string, unknown>
    | ValidationPayload<string, unknown>[]
    | undefined,
  shouldRender?: any
) => Promise<boolean>;

export const useForm = ReactHookForm;
