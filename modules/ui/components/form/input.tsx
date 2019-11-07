import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import OutlinedInput, { OutlinedInputProps } from "@material-ui/core/OutlinedInput";

type Props = Omit<OutlinedInputProps, "labelWidth"> & {
  label: string;
};

export const Input = (props: Props) => {
  const { label, ...inputProps } = props;

  const classes = useStyles();
  const id = `date-input-${label}`;

  return (
    <FormControl>
      <label className={classes.inputLabel} htmlFor={id}>
        {label}
      </label>
      <OutlinedInput
        fullWidth
        className={classes.input}
        id={id}
        labelWidth={0}
        {...inputProps}
      />
    </FormControl>
  );
};

const useStyles = makeStyles(theme => ({
  input: {
    backgroundColor: theme.customColors.white,
  },
  inputLabel: {
    color: theme.customColors.eduBlack,
    fontSize: theme.typography.pxToRem(14),
    marginBottom: theme.spacing(0.4),
    lineHeight: theme.typography.pxToRem(21)
  },
}));
