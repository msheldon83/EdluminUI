import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import ArrowDropDownIcon from "@material-ui/icons/ArrowDropDown";
import Fade from "@material-ui/core/Fade";
import Popper from "@material-ui/core/Popper";
import format from "date-fns/format";
import { DateRangePicker, DateRangePickerProps } from "./date-range-picker";
import { usePresetDateRanges } from "./hooks/use-preset-date-ranges";
import { InputLabel } from "./input";
import { useTranslation } from "react-i18next";

type DateRangePickerPopoverProps = DateRangePickerProps & {
  placeholder?: string;
  label?: string;
};

export const DateRangePickerPopover = (props: DateRangePickerPopoverProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const buttonRef = React.useRef(document.createElement("button"));
  const { matchesPreset } = usePresetDateRanges();

  const {
    onDateRangeSelected,
    startDate,
    endDate,
    placeholder = "",
    label = t("Date range"),
    ...datePickerProps
  } = props;

  const [showPopover, setShowPopover] = React.useState(false);
  const [startDateInternal, setStartDateInternal] = React.useState<
    Date | undefined
  >();
  const [endDateInternal, setEndDateInternal] = React.useState<
    Date | undefined
  >();

  // Internally tracking the date range to not overwrite originally passed in values
  React.useEffect(() => {
    setStartDateInternal(props.startDate);
    setEndDateInternal(props.endDate);
  }, [props.endDate, props.startDate]);

  // Figures out what to render in the input
  // date range, preset title, or placeholder
  const readableString = () => {
    const fallbackString =
      startDate !== undefined && endDate !== undefined
        ? `${format(startDate, "MMM d, yyyy")} - ${format(
            endDate,
            "MMM d, yyyy"
          )}`
        : placeholder;

    return matchesPreset(startDate, endDate)?.label ?? fallbackString;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (startDateInternal !== undefined && endDateInternal !== undefined) {
      onDateRangeSelected(startDateInternal, endDateInternal);
      setShowPopover(false);
    }
  };

  const close = React.useCallback(() => {
    setShowPopover(false);
    setStartDateInternal(props.startDate);
    setEndDateInternal(props.endDate);
  }, [props.endDate, props.startDate]);

  const handleClickOutside = React.useCallback(() => {
    if (showPopover) {
      close();
    }
  }, [close, showPopover]);

  const id = `custom-input-${Math.round(Math.random() * 1000)}`;

  return (
    <>
      {/* <Button
        variant="outlined"
        ref={buttonRef}
        onClick={() => setShowPopover(true)}
      >
        {readableString()}
      </Button> */}
      <InputLabel htmlFor={id} className={classes.label}>
        {label}
      </InputLabel>
      <div className={classes.trigger}>
        <button
          className={classes.button}
          id={id}
          ref={buttonRef}
          onClick={() => setShowPopover(true)}
        >
          {readableString()}
        </button>
        <ArrowDropDownIcon className={classes.arrowDownIcon} />
      </div>
      <Popper
        transition
        anchorEl={buttonRef.current}
        open={showPopover}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <form onSubmit={handleFormSubmit}>
              <ClickAwayListener
                mouseEvent="onMouseDown"
                onClickAway={handleClickOutside}
              >
                <Paper className={classes.popoverContainer} elevation={0}>
                  <DateRangePicker
                    {...datePickerProps}
                    startDate={startDateInternal}
                    endDate={endDateInternal}
                    onDateRangeSelected={(start, end) => {
                      setStartDateInternal(start);
                      setEndDateInternal(end);
                    }}
                  />
                  <div className={classes.actions}>
                    <div className={classes.cancelButton}>
                      <Button variant="outlined" onClick={() => close()}>
                        {t("Cancel")}
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="contained"
                        type="submit"
                        disabled={
                          startDateInternal === undefined ||
                          endDateInternal === undefined
                        }
                      >
                        {t("Apply")}
                      </Button>
                    </div>
                  </div>
                </Paper>
              </ClickAwayListener>
            </form>
          </Fade>
        )}
      </Popper>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  popoverContainer: {
    background: theme.customColors.white,
    boxShadow:
      "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24);",
    padding: theme.spacing(2),
    width: "700px", // TODO: need to make this work on mobile too
  },
  trigger: {
    display: "inline-block",
    position: "relative",
  },
  arrowDownIcon: {
    color: theme.customColors.edluminSubText,
    cursor: "pointer",
    position: "absolute",
    right: theme.spacing(2),
    top: "50%",
    transform: "translateY(-50%)",
  },
  label: {
    display: "block",
  },
  button: {
    backgroundColor: theme.customColors.white,
    borderRadius: theme.typography.pxToRem(4),
    borderWidth: theme.typography.pxToRem(1),
    borderStyle: "solid",
    boxSizing: "border-box",
    height: theme.typography.pxToRem(44),
    padding: `0 ${theme.typography.pxToRem(12)}`,
    borderColor: theme.customColors.edluminSubText,
    display: "block",
    fontSize: theme.typography.pxToRem(14),
    cursor: "pointer",
    minWidth: theme.typography.pxToRem(280),
    textAlign: "left",

    "&:hover": {
      borderColor: theme.customColors.edluminSubText,
    },
    "&:focus": {
      borderColor: theme.customColors.black,
    },
    "&:active": {
      borderColor: theme.customColors.black,
    },
  },
  actions: {
    alignItems: "flex-end",
    display: "flex",
  },
  cancelButton: {
    flex: "1 0 auto",
  },
}));
