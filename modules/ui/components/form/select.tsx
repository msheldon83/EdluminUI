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
import MuiSelect from "@material-ui/core/Select";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";

// Types from react-select
import { ValueType } from "react-select/src/types";
import { ControlProps } from "react-select/src/components/Control";
import { MenuProps, NoticeProps } from "react-select/src/components/Menu";
import { ValueContainerProps } from "react-select/src/components/containers";
import { OptionProps } from "react-select/src/components/Option";
import { SingleValueProps } from "react-select/src/components/SingleValue";
import { MultiValueProps } from "react-select/src/components/MultiValue";
import { useScreenSize } from "hooks";

type Props = {
  native?: boolean;
  multi?: boolean;
  value: SelectValueType;
  onChange: (value: SelectValueType) => void;
  /*
    Options are passed as a prop instead of as children so that
    support for native mode is configured automatically everywhere.
  */
  options: Array<OptionType>;
  label: string;
  disabled?: boolean;
};

interface OptionType {
  label: string | number;
  value?: string | number;
}

export type SelectValueType = ValueType<OptionType>;

type InputComponentProps = Pick<BaseTextFieldProps, "inputRef"> &
  React.HTMLAttributes<HTMLDivElement>;

export const Select: React.FC<Props> = props => {
  const theme = useTheme();

  const isSmallScreen = useScreenSize() === "mobile";
  // The multi-select doesn't really translate to using the native dropdown on smaller screens.
  const forceNative = !props.multi && isSmallScreen;

  return forceNative || props.native ? (
    <NativeSelect {...props} />
  ) : (
    <StyledSelect {...props} />
  );
};

export const NativeSelect: React.FC<Props> = props => {
  const classes = useStyles();
  const inputLabel = React.useRef<HTMLLabelElement>(null);
  const [labelWidth, setLabelWidth] = React.useState(0);

  React.useEffect(() => {
    setLabelWidth(inputLabel.current!.offsetWidth);
  }, []);

  /*
    This is not ideal, but because we are combining to elements that require
    two different types of data, the type checker is not happy. This alleviates
    that, but also ensures there is always a valid value.
  */
  const valueObject = props.value as any;
  const value = valueObject ? valueObject.value : "";

  const handleChange = (event: any) => {
    /*
    This gets the data needed to mimic the changed value coming from
    react-select. It should always be defined so need need to error check
    here.
    */
    const label = event.target.selectedOptions[0].innerText;
    const value = event.target.value;

    props.onChange({ label, value });
  };

  return (
    <FormControl variant="outlined" style={{ width: "100%" }}>
      <InputLabel ref={inputLabel} htmlFor={props.label}>
        {props.label}
      </InputLabel>
      <MuiSelect
        className={classes.nativeInput}
        native
        onChange={handleChange}
        labelWidth={labelWidth}
        inputProps={{
          name: props.label,
          id: props.label,
        }}
        disabled={props.disabled}
        value={value}
      >
        <option value="" />
        {props.options.map(option => {
          return (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          );
        })}
      </MuiSelect>
    </FormControl>
  );
};

export const StyledSelect: React.FC<Props> = props => {
  const classes = useStyles();
  const theme = useTheme();

  /*
    react-select does something weird with the label shrinking that unshrinks it
    even in scenarios where is shouldn't be. This state tracks focus so that
    doesn't happen.
  */
  const [hasFocus, setHasFocus] = React.useState(false);

  const selectStyles = {
    input: (base: React.CSSProperties) => ({
      ...base,
      color: theme.palette.text.primary,
      "& input": {
        font: "inherit",
      },
    }),
  };

  return (
    <ReactSelect
      classes={classes}
      styles={selectStyles}
      inputId="react-select-single"
      TextFieldProps={{
        label: props.label,
        InputLabelProps: {
          htmlFor: "react-select-single",
          shrink: !!props.value || hasFocus,
          placeholder: "",
        },
      }}
      options={props.options}
      components={components}
      placeholder=""
      value={props.value}
      onChange={props.onChange}
      isMulti={props.multi}
      hideSelectedOptions
      onFocus={() => setHasFocus(true)}
      onBlur={() => setHasFocus(false)}
      isClearable
    />
  );
};

const components = {
  Control,
  Menu,
  MultiValue,
  NoOptionsMessage,
  Option,
  ValueContainer,
  DropdownIndicator,
  IndicatorSeparator,
};

function IndicatorSeparator() {
  return null;
}

function DropdownIndicator() {
  const classes = useStyles();

  return <ArrowDropDownIcon className={classes.arrowDownIcon} />;
}

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
      minWidth: theme.typography.pxToRem(250),
    },
    input: {
      display: "flex",
      cursor: "pointer",
    },
    nativeInput: {
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
      borderRadius: theme.typography.pxToRem(4),
    },
    divider: {
      height: theme.spacing(2),
    },
    arrowDownIcon: {
      color: "rgba(0, 0, 0, 0.54)",
    },
  })
);
