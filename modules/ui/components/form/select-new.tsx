import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { useTheme } from "@material-ui/core";
import useAutocomplete from "@material-ui/lab/useAutocomplete";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Chip from "@material-ui/core/Chip";
import { TextButton } from "ui/components/text-button";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Input } from "./input";

export type SelectProps<T extends boolean> = {
  label?: string;
  placeholder?: string;
  multiple: T;
  options: Array<OptionType>;
  value?: T extends true ? Array<OptionType> : OptionType;
  onChange?: (value: T extends true ? Array<OptionType> : OptionType) => void;
  name?: string;
  disabled?: boolean;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string | undefined;

  // This should never be used if it's a multi-select
  withResetValue?: T extends true ? false : boolean;

  // TODO: implement
  native?: boolean;
};

export type OptionType = {
  label: string;
  value: string | number;
};

const TAG_CHIP_CONTAINER_HEIGHT = 36;
const RESET_LABEL = "-";

export function SelectNew<T extends boolean>(props: SelectProps<T>) {
  const classes = useStyles();
  const theme = useTheme();

  const {
    label,
    multiple = false,
    options,
    value = multiple ? [] : undefined,
    onChange = () => {},
    name,
    disabled = false,
    onBlur = () => {},
    onFocus = () => {},
    inputStatus = "default",
    validationMessage,
    placeholder,
    withResetValue = multiple ? false : true,
  } = props;

  const [showAllChips, setShowAllChips] = React.useState(false);
  const [hasOverflow, setHasOverFlow] = React.useState(false);
  const [tallEnoughForOverflow, setTallEnoughForOverflow] = React.useState(
    false
  );
  const [listOpen, setListOpen] = React.useState(false);

  // Reference to all the multiple values display
  const selectedChipsRef = React.useRef(null);

  // Operate on the options entry
  const getOptionLabel = (option: OptionType): string => {
    switch (option.label) {
      case RESET_LABEL: {
        return "";
      }
      default: {
        return option.label;
      }
    }
  };

  const getOptionValue = (option: OptionType): string | number => option.value;
  const getOptionSelected = (option: OptionType, value: OptionType) =>
    getOptionValue(option) === getOptionValue(value);

  const optionsWithReset = withResetValue
    ? ([
        {
          label: RESET_LABEL,
          value: "",
        },
      ] as Array<OptionType>).concat(options)
    : options;

  // Determine if the multi select display has over flow
  React.useEffect(() => {
    const element = selectedChipsRef.current || {
      offsetHeight: 0,
      scrollHeight: 0,
    };

    if (!element) {
      return;
    }

    const elementHasOverflow = element.offsetHeight < element.scrollHeight;

    const offsetHeight = theme.typography.pxToRem(element.offsetHeight);
    const triggerHeight = theme.typography.pxToRem(TAG_CHIP_CONTAINER_HEIGHT);

    setTallEnoughForOverflow(offsetHeight > triggerHeight);
    setHasOverFlow(elementHasOverflow);
  }, [value, showAllChips, theme.typography]);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    id: `${label}-${Date.now()}`,
    getOptionSelected,
    multiple,
    value,
    onChange: (e, selection) => {
      onChange(selection);

      // Keep list open if it's not a multi select
      if (!multiple) {
        setListOpen(false);
      }
    },
    options: optionsWithReset,
    getOptionLabel,
    open: listOpen,
  });

  const inputClasses = clsx({
    [classes.attachedInput]: listOpen,
  });

  const selectChipsClasses = clsx({
    [classes.selectedChips]: true,
    [classes.showAllSelectedChips]: showAllChips,
  });

  const containerClasses = clsx({
    [classes.selectContainer]: true,
    [classes.selectContainerDisabled]: disabled,
    active: listOpen,
  });

  const {
    onBlur: autocompoleteOnBlur,
    onFocus: autoCompleteonFocus,
    ...autocompleteInputProps
  } = getInputProps() as any;

  return (
    <div className={containerClasses} {...(disabled ? {} : getRootProps())}>
      <div className={classes.inputContainer}>
        <div className={classes.dropdownContainer}>
          <Input
            {...autocompleteInputProps}
            disabled={disabled}
            label={label}
            name={name}
            placeholder={placeholder}
            error={inputStatus === "error"}
            classes={{
              notchedOutline: inputClasses,
            }}
            endAdornment={
              <ArrowDropDownIcon
                onClick={e => {
                  e.stopPropagation();
                  setListOpen(!listOpen);
                }}
                className={classes.arrowDownIcon}
              />
            }
            onFocus={e => {
              onFocus(e);
              autoCompleteonFocus(e);
              setListOpen(true);
            }}
            onBlur={e => {
              onBlur(e);
              autocompoleteOnBlur(e);
              setListOpen(false);
            }}
            onClick={() => setListOpen(true)}
          />

          {listOpen && !disabled ? (
            <ul className={classes.listbox} {...getListboxProps()}>
              {groupedOptions.map((option, index) => {
                const itemClasses = clsx({
                  [classes.optionItem]: true,
                  [classes.resetLabel]: option.label === RESET_LABEL,
                });

                return (
                  <li
                    {...getOptionProps({ option, index })}
                    className={itemClasses}
                    key={getOptionValue(option)}
                  >
                    {option.label}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>

      {validationMessage && (
        <FormHelperText error={inputStatus === "error"}>
          {validationMessage}
        </FormHelperText>
      )}

      {multiple && value && Array.isArray(value) && value.length > 0 && (
        <div className={selectChipsClasses} ref={selectedChipsRef}>
          {value.map((valueItem: OptionType) => {
            return (
              <Chip
                key={getOptionValue(valueItem)}
                size="small"
                label={getOptionLabel(valueItem)}
                onDelete={() => {
                  const newValues = (value as Array<OptionType>).filter(
                    v => getOptionValue(v) !== getOptionValue(valueItem)
                  );

                  /*
                    The generics used for safety here were taking to long to solve the error
                    showing here. But, it's impossible for this to throw an error here.
                  */
                  // eslint-disable-next-line
                  // @ts-ignore
                  onChange(newValues);
                }}
                className={classes.selectionChip}
              />
            );
          })}

          {hasOverflow && !showAllChips && (
            <TextButton
              color="primary"
              className={classes.showAllButton}
              onClick={() => setShowAllChips(true)}
            >
              View more
            </TextButton>
          )}

          {value &&
            Array.isArray(value) &&
            value.length > 0 &&
            showAllChips &&
            tallEnoughForOverflow && (
              <TextButton
                color="primary"
                onClick={() => setShowAllChips(false)}
              >
                View less
              </TextButton>
            )}
        </div>
      )}
    </div>
  );
}

const useStyles = makeStyles(theme => ({
  selectContainer: {
    position: "relative",
    zIndex: 1,

    "&.active": {
      zIndex: 2,
    },
  },
  selectContainerDisabled: {
    pointerEvents: "none",
    cursor: "not-allowed",
  },
  inputContainer: {
    cursor: "text",
    fontSize: theme.typography.pxToRem(14),

    "& Input": {
      cursor: "text",
    },
  },

  dropdownContainer: {
    position: "relative",
  },
  attachedInput: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomWidth: 0,
  },
  arrowDownIcon: {
    color: theme.customColors.edluminSubText,
    cursor: "pointer",
    zIndex: 2,
  },
  listbox: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
    borderTopWidth: 0,
    color: theme.customColors.edluminSubText,
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(32),
    listStyle: "none",
    margin: 0,
    maxHeight: 200,
    overflow: "auto",
    padding: 0,
    paddingBottom: theme.spacing(1.5),
    position: "absolute",
    top: "calc(100% - 2px)",
    width: "100%",
    zIndex: 1,
  },
  optionItem: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),

    "&:hover": {
      color: theme.palette.text.primary,
      cursor: "pointer",
    },
    '&[aria-selected="true"]': {
      color: theme.palette.text.primary,
      cursor: "default",
    },
  },
  resetLabel: {
    color: theme.customColors.edluminSubText,

    '&[aria-selected="true"]': {
      color: theme.customColors.edluminSubText,
    },
  },
  showAllButton: {
    position: "absolute",
    height: "100%",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",

    "&:after": {
      content: "''",
      position: "absolute",
      top: 0,
      right: 0,
      background:
        "linear-gradient(270deg, rgba(255,255,255,1) 55%, rgba(255,255,255,0) 100%)",
      height: "100%",
      width: "200%",
      zIndex: -1,
    },
  },
  selectedChips: {
    boxSizing: "border-box",
    display: "flex",
    flexWrap: "wrap",
    paddingTop: theme.spacing(1),
    height: theme.typography.pxToRem(36),
    maxHeight: theme.typography.pxToRem(36),
    overflow: "hidden",
    transition: "all 300ms ease-in-out",
    position: "relative",
  },
  showAllSelectedChips: {
    height: "auto",
    maxHeight: theme.typography.pxToRem(999999),
  },
  selectionChip: {
    backgroundColor: theme.customColors.mediumBlue,
    color: theme.customColors.white,
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),

    "& svg": {
      color: theme.customColors.white,
      transition: "color 100ms linear",

      "&:hover": {
        color: "rgba(255, 255, 255, 0.7)",
      },
    },
  },
}));
