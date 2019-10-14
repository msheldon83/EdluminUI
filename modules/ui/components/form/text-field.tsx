import { Field, FieldAttributes } from "formik";
import * as FMUI from "formik-material-ui";
import { TextFieldProps as FMUITextFieldProps } from "formik-material-ui";
import * as React from "react";
import makeStyles from "@material-ui/core/styles/makeStyles";

export type TextFieldProps = {
  name: string;
} & FieldAttributes<{}> &
  FMUITextFieldProps["inputProps"];

/** A thin wrapper around Material UI TextField supporting Formik and translations. */
export const TextField: React.FunctionComponent<TextFieldProps> = props => {
  const classes = useStyles();

  return (
    <Field
      className={classes.alignCenter}
      component={FMUI.TextField}
      // label={props.translation && i18n(props.translation)}
      {...props}
    />
  );
};

const useStyles = makeStyles(theme => ({
  alignCenter: {
    justifyContent: "center",
  },
}));
