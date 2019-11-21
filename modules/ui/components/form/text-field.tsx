import { Field, FieldAttributes, useField, useFormikContext } from "formik";
import MUITextField from "@material-ui/core/TextField";
import { TextFieldProps as MUITextFieldProps } from "@material-ui/core/TextField";
import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

export type TextFieldProps = FieldAttributes<MUITextFieldProps>;

/** A thin wrapper around Material UI TextField supporting Formik and translations. */
export const TextField: React.FunctionComponent<TextFieldProps> = props => {
  const classes = useStyles();
  const formik = useFormikContext();
  const [field, meta] = useField(props.name);
  const error = meta.error;
  const showError = meta.touched && !!error;
  const disabled = formik.isSubmitting;

  return (
    <Field
      as={MUITextField}
      className={classes.alignCenter}
      error={showError}
      helperText={showError && error}
      disabled={disabled}
      variant="outlined"
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  alignCenter: {
    justifyContent: "center",
  },
}));
