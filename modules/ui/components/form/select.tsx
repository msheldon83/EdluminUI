import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, useTheme } from "@material-ui/core";
import useAutocomplete from "@material-ui/lab/useAutocomplete";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import InfoIcon from "@material-ui/icons/Info";
import Chip from "@material-ui/core/Chip";
import { TextButton } from "ui/components/text-button";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Input, LabelComponent } from "./input";
import { useMemo } from "react";
import { ErrorMessage } from "formik";
import {
  useKeyPress,
  ALL_KEYS,
  ESCAPE,
  ENTER,
  ARROW_DOWN,
  ARROW_UP,
} from "hooks/use-key-press";

export type SelectProps<T extends boolean> = {
  label?: string;
  labelComponent?: LabelComponent;
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
  className?: string;
  onSort?: (option1: OptionType, option2: OptionType) => 1 | -1 | 0;
  doSort?: boolean;
  fixedListBox?: boolean;
  readOnly?: boolean;
  inputClassName?: string;
  renderInputValue?: (
    value: T extends true ? Array<OptionType> : OptionType
  ) => string | number;

  // This should never be used if it's a multi-select
  withResetValue?: T extends true ? false : boolean;

  // TODO: implement
  native?: boolean;
};

export type OptionType = {
  label: string;
  value: string | number;
  info?: React.ReactNode;
  descriptor?: any;
};

const TAG_CHIP_CONTAINER_HEIGHT = 36;
const RESET_LABEL = "-";

export const resetOption = {
  label: "-",
  value: "",
};

export function Select<T extends boolean>(props: SelectProps<T>) {
  const classes = useStyles();
  const theme = useTheme();

  const {
    label,
    multiple = false,
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
    className,
    options,
    doSort = true,
    readOnly = false,
    inputClassName = "",
    renderInputValue,
    onSort = (a: OptionType, b: OptionType) =>
      a.label > b.label ? 1 : b.label > a.label ? -1 : 0,
    fixedListBox,
  } = props;

  const sortedOptions = useMemo(
    () => (doSort ? options.sort(onSort) : options),
    [options, onSort, doSort]
  );

  const [showAllChips, setShowAllChips] = React.useState(false);
  const [hasOverflow, setHasOverFlow] = React.useState(false);
  const [tallEnoughForOverflow, setTallEnoughForOverflow] = React.useState(
    false
  );
  const [listOpen, setListOpen] = React.useState(false);
  const [optionItemFocusedIndex, setOptionItemFocusedIndex] = React.useState<
    number
  >(-1);
  const [componentHasFocus, setComponentHasFocus] = React.useState(false);

  // Reference to all the multiple values display
  const selectedChipsRef = React.useRef(null);
  const inputRef = React.useRef(null);
  const containerRef = React.useRef(null);
  const listboxRef = React.useRef(null);

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
  const getOptionSelected = (option: OptionType, value: OptionType) => {
    return getOptionValue(option) === getOptionValue(value);
  };

  const optionsWithReset = withResetValue
    ? ([
        {
          label: RESET_LABEL,
          value: "",
        },
      ] as Array<OptionType>).concat(sortedOptions)
    : sortedOptions;

  // Determine if the multi select display has over flow
  React.useLayoutEffect(() => {
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
  }, [value, showAllChips, theme.typography, selectedChipsRef]);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
    inputValue,
    value: autoCompleteValue,
  } = useAutocomplete({
    id: `${label}-${Date.now()}`,
    getOptionSelected,
    multiple: multiple ? true : undefined,
    value: value as any, // The types in @material-ui's autocomplete are unusable
    onChange: (e: React.ChangeEvent<{}>, selection: any) => {
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

  // Set up keyboard events for arrow navigation
  const focusedOptionItemElement = React.useCallback(() => {
    return document.body.querySelector(`.${classes.optionItemFocused}`);
  }, [classes.optionItemFocused]);

  const focusNextOptionItem = React.useCallback(() => {
    if (!listOpen && !componentHasFocus) {
      return;
    }

    // The user can have focus on the input bug the list could be closed
    setListOpen(true);

    // Keeps from going out of bounds on the list
    const nextIndex =
      optionItemFocusedIndex + 1 > groupedOptions.length - 1
        ? 0
        : optionItemFocusedIndex + 1;

    setOptionItemFocusedIndex(nextIndex);
    focusedOptionItemElement()?.scrollIntoView({
      block: "nearest",
    });
  }, [
    optionItemFocusedIndex,
    groupedOptions.length,
    focusedOptionItemElement,
    listOpen,
    componentHasFocus,
  ]);

  const focusPreviousOptionItem = React.useCallback(() => {
    if (!listOpen && !componentHasFocus) {
      return;
    }

    // The user can have focus on the input bug the list could be closed
    setListOpen(true);

    // Keeps from going out of bounds on the list
    const nextIndex =
      optionItemFocusedIndex - 1 < 0
        ? groupedOptions.length - 1
        : optionItemFocusedIndex - 1;

    setOptionItemFocusedIndex(nextIndex);
    focusedOptionItemElement()?.scrollIntoView({
      block: "nearest",
    });
  }, [
    optionItemFocusedIndex,
    groupedOptions.length,
    focusedOptionItemElement,
    listOpen,
    componentHasFocus,
  ]);

  const resetFocusedOptionItem = () => setOptionItemFocusedIndex(-1);

  /*
    Using a DOM element click even here so that the autocomplete hook can correctly keep
    itself in sync and propogate all of the events correctly
  */
  const selectFocusedOptionItem = () => focusedOptionItemElement()?.click();

  useKeyPress(ARROW_DOWN, () => focusNextOptionItem(), inputRef.current);

  useKeyPress(ARROW_UP, () => focusPreviousOptionItem(), inputRef.current);

  useKeyPress(
    ESCAPE,
    () => {
      if (!listOpen) {
        return;
      }

      const input = inputRef.current as HTMLInputElement | null;

      // Force a blur on the input so the UI can reset properly
      input?.blur();

      resetFocusedOptionItem();
    },
    inputRef.current
  );

  useKeyPress(
    ENTER,
    () => {
      if (optionItemFocusedIndex < 0 || !listOpen) {
        return;
      }

      selectFocusedOptionItem();
      resetFocusedOptionItem();
    },
    inputRef.current
  );

  /*
    This section tracks the width of the listbox as compared to the container.
    If it is wider, it will have a layout overflow wider than the container
    which requires that the top right border radius get set to not let there be a sharp
    edge there when there aren't any sharp edges anywhere else
  */
  const [listboxHasYOverflow, setListBoxHasYOverflow] = React.useState(false);
  const listBoxClasses = clsx({
    [classes.listbox]: true,
    [classes.listboxXOverflow]: listboxHasYOverflow,
    [classes.fixedListBox]: fixedListBox,
  });
  const listBoxStyle = fixedListBox
    ? {
        minWidth: "unset",
        width:
          (inputRef.current as HTMLInputElement | null)?.parentElement?.getBoundingClientRect()
            .width ?? 0,
      }
    : {};
  React.useLayoutEffect(() => {
    const container = containerRef.current as HTMLInputElement | null;
    const listbox = listboxRef.current as HTMLElement | null;

    const containerWidth = container?.getBoundingClientRect().width ?? 0;
    const listBoxWidth = listbox?.getBoundingClientRect().width ?? 0;

    setListBoxHasYOverflow(listBoxWidth > containerWidth);
  }, [setListBoxHasYOverflow, containerRef, listboxRef, listOpen]);

  const inputClasses = `${clsx({
    [classes.attachedInput]: listOpen,
  })} ${inputClassName}`;

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

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    const input = inputRef.current as HTMLInputElement | null;

    input?.focus();

    /*
      Manually trigger the focus event because sometimes it's already focused
      when it's a single select and the dropdown needs to reopen
    */
    input?.dispatchEvent(new Event("focus"));
  };

  /*
    Keeping a selecting value and a typed value in sync is difficult. This makes sure
    that the auto complete is always displaying the latest value correctly
  */
  const renderableValue = multiple
    ? inputValue
    : renderInputValue
    ? renderInputValue(value as any)
    : inputValue ?? (value as any)?.label ?? "";

  return (
    <div
      className={`${className} ${containerClasses}`}
      {...(disabled ? {} : getRootProps())}
      ref={containerRef}
      onFocus={() => setComponentHasFocus(true)}
      onBlur={() => setComponentHasFocus(false)}
    >
      <div className={classes.inputContainer}>
        <div className={classes.dropdownContainer}>
          <Input
            {...autocompleteInputProps}
            value={renderableValue}
            inputRef={inputRef}
            disabled={disabled}
            label={label}
            labelComponent={props.labelComponent}
            name={name}
            placeholder={placeholder}
            error={inputStatus === "error"}
            readOnly={readOnly}
            classes={{
              notchedOutline: inputClasses,
              input: classes.input,
            }}
            endAdornment={
              <ArrowDropDownIcon
                onClick={handleArrowClick}
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
            <ul
              className={listBoxClasses}
              {...getListboxProps()}
              style={listBoxStyle}
              ref={listboxRef}
            >
              {groupedOptions.map((option: OptionType, index: number) => {
                const itemClasses = clsx({
                  [classes.optionItem]: true,
                  [classes.optionItemFocused]: index === optionItemFocusedIndex,
                  [classes.resetLabel]: option.label === RESET_LABEL,
                });

                return (
                  <li
                    {...getOptionProps({ option, index })}
                    onMouseEnter={() => setOptionItemFocusedIndex(index)}
                    onMouseLeave={() => resetFocusedOptionItem()}
                    className={itemClasses}
                    key={getOptionValue(option)}
                  >
                    <div className={classes.optionText}>{option.label}</div>
                    {option.info && (
                      <Tooltip title={option.info}>
                        <InfoIcon className={classes.infoIcon} />
                      </Tooltip>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>
      </div>
      {name && (
        <ErrorMessage
          name={name}
          render={msg => <div className={classes.errorMessage}>{msg}</div>}
        />
      )}

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
                size="medium"
                label={getOptionLabel(valueItem)}
                onDelete={() => {
                  const newValues = (value as Array<OptionType>).filter(
                    v => getOptionValue(v) !== getOptionValue(valueItem)
                  );

                  (onChange as (o: OptionType[]) => void)(newValues);
                }}
                className={classes.selectionChip}
              />
            );
          })}

          {hasOverflow && !showAllChips && (
            <TextButton
              color="primary"
              className={classes.showAllButton}
              onClick={() => {
                setShowAllChips(true);
                setTallEnoughForOverflow(true);
              }}
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
    zIndex: 100,

    "&.active": {
      zIndex: 200,
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
    borderBottomWidth: "0 !important",
    zIndex: 110,
    background: "white",
    boxShadow: "inset 0 -1px #fff",
  },
  input: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap",
    position: "relative",
    zIndex: 201,
  },
  arrowDownIcon: {
    color: theme.customColors.edluminSubText,
    cursor: "pointer",
    zIndex: 200,
  },
  infoIcon: {
    color: theme.customColors.edluminSubText,
    zIndex: 200,
  },
  listbox: {
    backgroundColor: theme.palette.background.paper,
    border: `1px solid ${theme.palette.text.primary}`,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(32),
    listStyle: "none",
    margin: 0,
    maxHeight: theme.typography.pxToRem(200),
    overflow: "auto",
    padding: 0,
    paddingBottom: theme.spacing(1.5),
    position: "absolute",
    top: "calc(100% - 1px)",
    minWidth: "100%",
    zIndex: 100,
  },
  fixedListBox: {
    position: "fixed!important" as any,
    top: "auto!important",
  },
  listboxXOverflow: {
    borderTopRightRadius: theme.typography.pxToRem(4),
  },
  optionItem: {
    paddingLeft: theme.spacing(1.5),
    paddingRight: theme.spacing(1.5),
    alignItems: "center",
    display: "flex",
    width: "100%",

    "&:hover": {
      cursor: "pointer",
    },
    '&[aria-selected="true"]': {
      backgroundColor: theme.customColors.yellow1,
      cursor: "pointer",
    },
  },
  optionItemFocused: {
    backgroundColor: theme.background.hoverRow,
    color: theme.palette.text.primary,
    cursor: "pointer",

    '&[aria-selected="true"]': {
      backgroundColor: theme.background.hoverRow,
    },
  },
  resetLabel: {
    color: theme.customColors.edluminSubText,

    '&[aria-selected="true"]': {
      color: theme.customColors.edluminSubText,
    },
  },
  optionText: {
    width: "100%",
  },
  showAllButton: {
    position: "absolute",
    height: "100%",
    right: 0,
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,

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
    marginTop: theme.spacing(1),
    height: theme.typography.pxToRem(36),
    maxHeight: theme.typography.pxToRem(36),
    lineHeight: theme.typography.pxToRem(36),
    overflow: "hidden",
    position: "relative",
  },
  showAllSelectedChips: {
    height: "auto",
    maxHeight: theme.typography.pxToRem(999999),
  },
  selectionChip: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.palette.text.primary,
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    position: "relative",

    "& svg": {
      color: theme.customColors.white,
      position: "relative",
      transition: "color 100ms linear",
      zIndex: 2,

      "&:hover": {
        color: theme.customColors.white,
      },
    },

    "&::after": {
      display: "inline-block",
      content: "''",
      width: theme.typography.pxToRem(8),
      height: theme.typography.pxToRem(8),
      backgroundColor: "rgba(0,0,0,1)",
      position: "absolute",
      top: "50%",
      transform: "translateY(-50%)",
      right: theme.typography.pxToRem(12),
      zIndex: 1,
    },
  },
  errorMessage: {
    color: "#C62828",
    marginLeft: theme.typography.pxToRem(14),
    marginRight: theme.typography.pxToRem(14),
    marginTop: "3px",
    fontSize: "0.75rem",
    fontFamily: "Roboto",
    fontWeight: 400,
    lineHeight: 1.66,
  },
}));
