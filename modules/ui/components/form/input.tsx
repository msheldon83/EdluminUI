import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import FormControl from "@material-ui/core/FormControl";
import OutlinedInput, {
  OutlinedInputProps,
} from "@material-ui/core/OutlinedInput";

type Props = Omit<OutlinedInputProps, "labelWidth"> & {
  label: string;
  withSpacing?: boolean;
  InputComponent?: React.ElementType;
  inputComponentProps?: Record<string, any>;
};

export const Input = React.forwardRef((props: Props, ref) => {
  const {
    label,
    InputComponent,
    inputComponentProps = {},
    className = "",
    withSpacing = false,
    ...restOfInputProps
  } = props;

  const classes = useStyles();
  const id = `custom-input-${label}`;

  const classNames = clsx({
    [classes.formControl]: true,
    [className]: true,
    [classes.withSpacing]: withSpacing,
  });

  const inputClassNames = clsx({
    [classes.input]: true,
    [classes.disabled]: restOfInputProps.disabled,
  });

  return (
    <FormControl className={classNames}>
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
          className={inputClassNames}
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
  children: string;
  htmlFor?: string;
  className?: string;
};

export const InputLabel = (props: InputLabelProps) => {
  const { children, htmlFor, className = "" } = props;

  const classes = useStyles();

  const classNames = clsx({
    [classes.inputLabel]: true,
    [className]: true,
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
}));
