import ReactHookForm from "react-hook-form";

export type Register = ReturnType<typeof ReactHookForm>["register"];
export type SetValue = ReturnType<typeof ReactHookForm>["setValue"];

export const useForm = ReactHookForm;
