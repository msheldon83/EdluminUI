import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import FormHelperText from "@material-ui/core/FormHelperText";
import OutlinedInput, {
  OutlinedInputProps,
} from "@material-ui/core/OutlinedInput";

export type LabelComponent = React.FC<Omit<InputLabelProps, "children">>;

export type InputProps = Omit<OutlinedInputProps, "labelWidth"> & {
  label?: string; // optional for now, but in the future should be required
  labelComponent?: LabelComponent;
  withSpacing?: boolean;
  InputComponent?: React.ElementType;
  inputComponentProps?: Record<string, any>;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string;
  helperMessage?: string;
  readOnly?: boolean;
};

export const Input = React.forwardRef((props: InputProps, ref) => {
  const {
    label,
    labelComponent,
    InputComponent,
    inputComponentProps = {},
    className = "",
    withSpacing = false,
    inputStatus = "default",
    validationMessage,
    helperMessage,
    readOnly = false,
    ...restOfInputProps
  } = props;

  const classes = useStyles();
  const id = `custom-input-${label ? label : Math.round(Math.random() * 1000)}`;

  const isError = inputStatus === "error";

  const classNames = clsx({
    [classes.formControl]: true,
    [className]: true,
    [classes.withSpacing]: withSpacing,
  });

  const inputClassNames = clsx({
    [classes.input]: true,
    [classes.disabled]: restOfInputProps.disabled,
  });

  const helperText = validationMessage ? validationMessage : helperMessage;

  return (
    <FormControl className={classNames} error={isError}>
      {labelComponent ? (
        labelComponent({ htmlFor: id, error: isError })
      ) : label ? (
        <InputLabel htmlFor={id} error={isError}>
          {label}
        </InputLabel>
      ) : (
        undefined
      )}
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
          className={inputClassNames}
          notched={false}
          id={id}
          name={id}
          labelWidth={0}
          ref={ref}
          readOnly={readOnly}
          {...restOfInputProps}
        />
      )}
      {helperText && (
        <FormHelperText error={isError}>{helperText}</FormHelperText>
      )}
    </FormControl>
  );
});

type InputLabelProps = {
  children: string;
  htmlFor?: string;
  className?: string;
  error?: boolean;
};

export const InputLabel = (props: InputLabelProps) => {
  const { children, htmlFor, error, className = "" } = props;

  const classes = useStyles();

  const classNames = clsx({
    [classes.inputLabel]: true,
    [className]: true,
    [classes.error]: error,
  });

  /* Convert this to FormLabel */
  return (
    <label className={classNames} htmlFor={htmlFor}>
      {children}
    </label>
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
    lineHeight: theme.typography.pxToRem(21),
  },
  formControl: {
    width: "100%",
  },
  withSpacing: {
    paddingBottom: theme.spacing(1.5),
  },
  disabled: {
    backgroundColor: theme.customColors.grayWhite,
  },
  error: {
    color: theme.palette.error.main,
  },
}));
