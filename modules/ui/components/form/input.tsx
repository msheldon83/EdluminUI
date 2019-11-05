import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import OutlinedInput from "@material-ui/core/OutlinedInput";

type Props = {
  label: string;
};

export const Input = (props: Props) => {
  const { label } = props;

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
    fontSize: theme.typography.pxToRem(13),
    fontWeight: 500,
    marginBottom: theme.spacing(0.4),
  },
}));
