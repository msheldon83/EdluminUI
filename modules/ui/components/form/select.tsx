import * as React from "react";
import ReactSelect from "react-select";
import {
  makeStyles,
  emphasize,
  Theme,
  createStyles,
  useTheme,
} from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Typography from "@material-ui/core/Typography";
import Chip from "@material-ui/core/Chip";
import TextField, { BaseTextFieldProps } from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import CancelIcon from "@material-ui/icons/Cancel";

// Types from react-select
import { ValueType } from "react-select/src/types";
import { ControlProps } from "react-select/src/components/Control";
import { MenuProps, NoticeProps } from "react-select/src/components/Menu";
import { ValueContainerProps } from "react-select/src/components/containers";
import { OptionProps } from "react-select/src/components/Option";
import { SingleValueProps } from "react-select/src/components/SingleValue";
import { MultiValueProps } from "react-select/src/components/MultiValue";

type Props = {
  native?: boolean;
  multi?: boolean;
  value: SelectValueType;
  onChange?: (value: SelectValueType) => void;
  /*
    Options are passed as a prop instead of as children so that
    support for native mode is configured automatically everywhere.
  */
  options: Array<OptionType>;
  label: string;
  disabled?: boolean;
  placeholder?: string;
};

// TODO: bring back old component logic to support Native

export const Select: React.FC<Props> = props => {
  const classes = useStyles();
  const theme = useTheme();

  const selectStyles = {
    input: (base: React.CSSProperties) => ({
      ...base,
      color: theme.palette.text.primary,
      "& input": {
        font: "inherit",
      },
    }),
  };

  /*
    The divider isn't necessary to render unless it meets 2 conditions:
      1. There is a value selected
      2. It is in multi-selec tmode

    The divider helps separate the clear button from the dropdown button
  */
  const hasValue = false;
  // const hasValue = props.multi
  //   ? props.value && props.value.length > 0
  //   : props.value;
  const showIndicatorDivider = hasValue && props.multi;
  // undefined means don't override and () => means render nothing
  const extraComponents = showIndicatorDivider
    ? {}
    : { IndicatorSeparator: () => null };

  return (
    <ReactSelect
      classes={classes}
      styles={selectStyles}
      inputId="react-select-single"
      TextFieldProps={{
        label: props.label,
        InputLabelProps: {
          htmlFor: "react-select-single",
          shrink: true,
        },
      }}
      placeholder={props.placeholder}
      options={props.options}
      components={{
        ...components,
        ...extraComponents,
      }}
      value={props.value}
      onChange={props.onChange}
      isMulti={props.multi}
      hideSelectedOptions
    />
  );
};

interface OptionType {
  label: string | number;
  value: string | number;
}

export type SelectValueType = ValueType<OptionType>;

type InputComponentProps = Pick<BaseTextFieldProps, "inputRef"> &
  React.HTMLAttributes<HTMLDivElement>;

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  // SingleValue,
  ValueContainer,
};

function Menu(props: MenuProps<OptionType>) {
  return (
    <Paper
      square
      className={props.selectProps.classes.paper}
      {...props.innerProps}
    >
      {props.children}
    </Paper>
  );
}

function inputComponent({ inputRef, ...props }: InputComponentProps) {
  return <div ref={inputRef} {...props} />;
}

function Control(props: ControlProps<OptionType>) {
  const {
    children,
    innerProps,
    innerRef,
    selectProps: { classes, TextFieldProps },
  } = props;

  return (
    <TextField
      fullWidth
      variant="outlined"
      InputProps={{
        inputComponent,
        inputProps: {
          className: classes.input,
          ref: innerRef,
          children,
          ...innerProps,
        },
      }}
      {...TextFieldProps}
    />
  );
}

function ValueContainer(props: ValueContainerProps<OptionType>) {
  return (
    <div className={props.selectProps.classes.valueContainer}>
      {props.children}
    </div>
  );
}

function NoOptionsMessage(props: NoticeProps<OptionType>) {
  return (
    <Typography
      color="textSecondary"
      className={props.selectProps.classes.noOptionsMessage}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function Option(props: OptionProps<OptionType>) {
  const theme = useTheme();

  return (
    <MenuItem
      ref={props.innerRef}
      selected={props.isFocused}
      component="div"
      style={{
        fontWeight: props.isSelected ? 500 : 400,
        fontSize: theme.typography.button.fontSize,
      }}
      {...props.innerProps}
    >
      {props.children}
    </MenuItem>
  );
}

function SingleValue(props: SingleValueProps<OptionType>) {
  return (
    <Typography
      className={props.selectProps.classes.singleValue}
      {...props.innerProps}
    >
      {props.children}
    </Typography>
  );
}

function MultiValue(props: MultiValueProps<OptionType>) {
  const className = `${props.selectProps.classes.chip} ${
    props.isFocused ? props.selectProps.classes.chipFocused : ""
  }`;

  return (
    <Chip
      tabIndex={-1}
      size="small"
      label={props.children}
      className={className}
      onDelete={props.removeProps.onClick}
      deleteIcon={<CancelIcon {...props.removeProps} />}
    />
  );
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
      height: theme.typography.pxToRem(250),
      minWidth: theme.typography.pxToRem(250),
    },
    input: {
      display: "flex",
      padding: theme.spacing(1.5),
      height: "auto",
      cursor: "pointer",
    },
    valueContainer: {
      display: "flex",
      flexWrap: "wrap",
      flex: 1,
      alignItems: "center",
      overflow: "hidden",
      paddingLeft: theme.spacing(0.5),
    },
    chip: {
      margin: theme.spacing(0.5, 0.25),
      fontSize: theme.typography.button.fontSize,
    },
    chipFocused: {
      backgroundColor: emphasize(
        theme.palette.type === "light"
          ? theme.palette.grey[300]
          : theme.palette.grey[700],
        0.08
      ),
    },
    noOptionsMessage: {
      padding: theme.spacing(1, 2),
    },
    singleValue: {
      fontSize: theme.typography.button.fontSize,
    },
    paper: {
      position: "absolute",
      zIndex: 1,
      marginTop: theme.spacing(1),
      left: 0,
      right: 0,
    },
    divider: {
      height: theme.spacing(2),
    },
  })
);
