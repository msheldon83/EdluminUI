import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import OutlinedInput, {
  OutlinedInputProps,
} from "@material-ui/core/OutlinedInput";

type Props = Omit<OutlinedInputProps, "labelWidth"> & {
  label: string;
  InputComponent?: React.ElementType;
  inputComponentProps?: Record<string, any>;
};

export const Input = React.forwardRef((props: Props, ref) => {
  const {
    label,
    InputComponent,
    inputComponentProps = {},
    ...restOfInputProps
  } = props;

  const classes = useStyles();
  const id = `custom-input-${label}`;

  return (
    <FormControl className={classes.formControl}>
      <InputLabel htmlFor={id}>{label}</InputLabel>
      {InputComponent ? (
        <InputComponent
          ref={ref}
          id={id}
          name={id}
          {...restOfInputProps}
          {...inputComponentProps}
        />
      ) : (
        <OutlinedInput
          fullWidth
          className={classes.input}
          id={id}
          name={id}
          labelWidth={0}
          ref={ref}
          {...restOfInputProps}
        />
      )}
    </FormControl>
  );
});

type InputLabelProps = {
  htmlFor: string;
  children: string;
};

export const InputLabel = (props: InputLabelProps) => {
  const { children, htmlFor } = props;

  const classes = useStyles();

  /* Convert this to FormLabel */
  return (
    <label className={classes.inputLabel} htmlFor={htmlFor}>
      {children}
    </label>
  );
};

const useStyles = makeStyles(theme => ({
  input: {
    backgroundColor: theme.customColors.white,
  },
  inputLabel: {
    cursor: "pointer",
    color: theme.customColors.eduBlack,
    fontSize: theme.typography.pxToRem(14),
    marginBottom: theme.spacing(0.4),
    lineHeight: theme.typography.pxToRem(21),
  },
  formControl: {
    width: "100%",
  },
}));
