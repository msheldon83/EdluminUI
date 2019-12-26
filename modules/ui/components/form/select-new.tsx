import * as React from "react";
import clsx from "clsx";
import initial from "lodash-es/initial";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import useAutocomplete from "@material-ui/lab/useAutocomplete";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Chip from "@material-ui/core/Chip";
import { TextButton } from "ui/components/text-button";
import FormHelperText from "@material-ui/core/FormHelperText";
import { Input } from "./input";

export type SelectProps<T extends boolean> = {
  label?: string;
  multiple?: T;
  options: Array<OptionType>;
  value?: T extends true ? Array<OptionType> : OptionType;
  onChange?: (value: T extends true ? Array<OptionType> : OptionType) => void;
  name?: string;
  disabled?: boolean;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  inputStatus?: "warning" | "error" | "success" | "default" | undefined | null;
  validationMessage?: string | undefined;

  // TODO: implement
  native?: boolean;
};

export type OptionType = {
  title: string;
  value: string | number;
};

export function SelectNew<T extends boolean>(props: SelectProps<T>) {
  const classes = useStyles();

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
  } = props;

  const [showAllChips, setShowAllChips] = React.useState(false);
  const [hasOverflow, setHasOverFlow] = React.useState(false);
  const [listOpen, setListOpen] = React.useState(false);

  // Reference to all the multiple values display
  const selectedChipsRef = React.useRef(null);

  // Operate on the options entry
  const getOptionLabel = (option: OptionType): string => option.title;
  const getOptionValue = (option: OptionType): string | number => option.value;
  const getOptionSelected = (option: OptionType, value: OptionType) =>
    getOptionValue(option) === getOptionValue(value);

  // Determine if the multi select display has over flow
  React.useEffect(() => {
    const element = selectedChipsRef.current || {
      offsetHeight: 0,
      scrollHeight: 0,
    };

    if (element === null || !element) {
      return;
    }

    const elementHasOverflow = element.offsetHeight < element.scrollHeight;

    setHasOverFlow(elementHasOverflow);
  }, [value, showAllChips]);

  const {
    getRootProps,
    getInputProps,
    getListboxProps,
    getOptionProps,
    groupedOptions,
  } = useAutocomplete({
    id: "use-autocomplete-demo",
    getOptionSelected,
    multiple,
    value,
    onChange: (e, value) => {
      onChange(value);

      // Keep list open if it's not a multi select
      if (!multiple) {
        console.log("here");
        setListOpen(false);
      }
    },
    options,
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

  return (
    <div
      className={classes.selectContainer}
      {...(disabled ? {} : getRootProps())}
    >
      <div className={classes.inputContainer}>
        <div className={classes.dropdownContainer}>
          <Input
            {...(disabled ? {} : getInputProps())}
            disabled={disabled}
            label={label}
            name={name}
            placeholder="This is the placeholder"
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
              setListOpen(true);
            }}
            onBlur={e => {
              onBlur(e);
              setListOpen(false);
            }}
            onClick={() => setListOpen(true)}
          />

          {listOpen && !disabled ? (
            <ul className={classes.listbox} {...getListboxProps()}>
              {groupedOptions.map((option, index) => (
                <li
                  {...getOptionProps({ option, index })}
                  key={getOptionValue(option)}
                >
                  {option.title}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {validationMessage && (
        <FormHelperText error={inputStatus === "error"}>
          {validationMessage}
        </FormHelperText>
      )}

      {multiple && value && Array.isArray(value) && (
        <div className={selectChipsClasses} ref={selectedChipsRef}>
          {value.map(valueItem => {
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

          {showAllChips && (
            <TextButton color="primary" onClick={() => setShowAllChips(false)}>
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
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(32),
    color: theme.customColors.edluminSubText,
    top: "calc(100% - 2px)",
    margin: 0,
    zIndex: 1,
    position: "absolute",
    listStyle: "none",
    backgroundColor: theme.palette.background.paper,
    overflow: "auto",
    maxHeight: 200,
    width: "100%",
    border: `1px solid ${theme.palette.text.primary}`,
    borderTopWidth: 0,
    borderRadius: `0 0 ${theme.typography.pxToRem(
      4
    )} ${theme.typography.pxToRem(4)}`,
    padding: 0,
    paddingBottom: theme.spacing(1.5),

    "& li": {
      paddingLeft: theme.spacing(1.5),
      paddingRight: theme.spacing(1.5),
    },

    '& li[data-focus="true"]': {
      color: theme.palette.text.primary,
      cursor: "pointer",
    },
    '& li[aria-selected="true"]': {
      color: theme.palette.text.primary,
      cursor: "pointer",
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
