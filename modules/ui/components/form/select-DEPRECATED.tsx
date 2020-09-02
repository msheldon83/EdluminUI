import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Paper from "@material-ui/core/Paper";
import MuiSelect from "@material-ui/core/Select";
import {
  createStyles,
  emphasize,
  makeStyles,
  Theme,
  useTheme,
} from "@material-ui/core/styles";
import TextField, { BaseTextFieldProps } from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import FormHelperText from "@material-ui/core/FormHelperText";
// Types from react-select
import { ValueType } from "react-select/src/types";
import CancelIcon from "@material-ui/icons/Cancel";
import { useIsMobile } from "hooks";
import * as React from "react";
import ReactSelect from "react-select";
import { ValueContainerProps } from "react-select/src/components/containers";
import { ControlProps } from "react-select/src/components/Control";
import { MenuProps, NoticeProps } from "react-select/src/components/Menu";
import { MultiValueProps } from "react-select/src/components/MultiValue";
import { OptionProps } from "react-select/src/components/Option";

export type Props = {
  native?: boolean;
  multi?: boolean;
  value: SelectValueType;
  onChange: (value: SelectValueType) => void;
  /*
  Options are passed as a prop instead of as children so that
  support for native mode is configured automatically everywhere.
  */
  options: Array<OptionType>;
  label?: string;
  disabled?: boolean;
  withDropdownIndicator?: boolean;
  filterOption?: ((option: OptionType, rawInput: string) => boolean) | null;
  isClearable?: boolean;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  name?: string;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string | undefined;
};

export interface OptionType {
  label: string | number;
  value?: string | number;
}

export type SelectValueType = ValueType<OptionType>;

type InputComponentProps = Pick<BaseTextFieldProps, "inputRef"> &
  React.HTMLAttributes<HTMLDivElement>;

export const SelectDEPRECATED: React.FC<Props> = props => {
  const theme = useTheme();

  const isSmallScreen = useIsMobile();
  // The multi-select doesn't really translate to using the native dropdown on smaller screens.
  const forceNative = !props.multi && isSmallScreen;

  return forceNative || props.native ? (
    <NativeSelect {...props} />
  ) : (
    <StyledSelect {...props} />
  );
};

SelectDEPRECATED.defaultProps = {
  withDropdownIndicator: true,
  isClearable: true,
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

  const { inputStatus = "default" } = props;
  const isError = inputStatus === "error";

  return (
    <FormControl variant="outlined" style={{ width: "100%" }} error={isError}>
      <InputLabel ref={inputLabel} htmlFor={props.label}>
        {props.label}
      </InputLabel>
      <MuiSelect
        name={props.name}
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
      {props.validationMessage && (
        <FormHelperText error={isError}>
          {props.validationMessage}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export const StyledSelect: React.FC<Props> = props => {
  const classes = useStyles(props);
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

  const DropdownIndicator = () =>
    props.withDropdownIndicator ? (
      <ArrowDropDownIcon className={classes.arrowDownIcon} />
    ) : null;

  const id = `react-select-${
    props.label ? props.label : Math.round(Math.random() * 1000)
  }`;

  return (
    <ReactSelect
      name={props.name}
      classes={classes}
      styles={selectStyles}
      inputId={id}
      TextFieldProps={{
        label: props.label,
        InputLabelProps: {
          htmlFor: id,
          shrink: !!props.value || hasFocus,
          placeholder: "",
        },
      }}
      options={props.options}
      components={{
        Control,
        Menu,
        MultiValue,
        NoOptionsMessage,
        Option,
        ValueContainer,
        DropdownIndicator,
        IndicatorSeparator,
      }}
      placeholder=""
      value={props.value}
      onChange={props.onChange}
      isMulti={props.multi}
      hideSelectedOptions={props.multi}
      onFocus={e => {
        setHasFocus(true);
        props.onFocus && props.onFocus(e);
      }}
      onBlur={e => {
        setHasFocus(false);
        props.onBlur && props.onBlur(e);
      }}
      isClearable={props.isClearable}
      isDisabled={props.disabled}
      filterOption={props.filterOption}
      inputStatus={props.inputStatus}
      validationMessage={props.validationMessage}
    />
  );
};

function IndicatorSeparator() {
  return null;
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
    selectProps: {
      classes,
      TextFieldProps,
      inputStatus = "default",
      validationMessage,
    },
  } = props;

  const isError = inputStatus === "error";

  return (
    <>
      <TextField
        fullWidth
        variant="outlined"
        error={isError}
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
      {validationMessage && (
        <FormHelperText error={isError}>{validationMessage}</FormHelperText>
      )}
    </>
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
      /*
        This magic number is the total of th eborders and padding to default
        Mui inputs. Since this component transitions between a styled and native
        select dropdown, this ensures things don't get weird in multi select
        mode.
      */
      height: theme.typography.pxToRem(56),
      paddingTop: 0,
      paddingBottom: 0,
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
    paper: {
      position: "absolute",
      zIndex: 20,
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
