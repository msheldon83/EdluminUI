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
import clsx from "clsx";

type DateRangePickerPopoverProps = DateRangePickerProps & {
  placeholder?: string;
  label?: string;
  useStandardWidth?: boolean;
};

export const DateRangePickerPopover = (props: DateRangePickerPopoverProps) => {
  const { t } = useTranslation();
  const classes = useStyles();
  const triggerRef = React.useRef(null);
  const { getPresetByDates } = usePresetDateRanges();

  const {
    onDateRangeSelected,
    startDate,
    endDate,
    placeholder = "",
    label,
    useStandardWidth,
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

    return getPresetByDates(startDate, endDate)?.label ?? fallbackString;
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (startDateInternal !== undefined && endDateInternal !== undefined) {
      onDateRangeSelected(startDateInternal, endDateInternal);
      setShowPopover(false);
    }
  };

  const closePicker = React.useCallback(() => setShowPopover(false), []);

  const handleClickOutside = React.useCallback(() => {
    if (showPopover) {
      closePicker();
    }
  }, [closePicker, showPopover]);

  const id = `custom-input-${Math.round(Math.random() * 1000)}`;

  return (
    <>
      <div>
        <InputLabel htmlFor={id} className={classes.label}>
          {label ?? t("Date range")}
        </InputLabel>
      </div>
      <div
        className={clsx(
          classes.trigger,
          useStandardWidth ? classes.divStandardWidth : undefined
        )}
        ref={triggerRef}
      >
        <button
          className={clsx(
            classes.button,
            useStandardWidth
              ? classes.buttonStandardWidth
              : classes.buttonMinWidth
          )}
          id={id}
          onClick={() => setShowPopover(true)}
        >
          {readableString()}
        </button>
        <ArrowDropDownIcon className={classes.arrowDownIcon} />
      </div>
      <Popper
        transition
        anchorEl={triggerRef.current}
        open={showPopover}
        placement="top-start"
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
                      <Button variant="outlined" onClick={() => closePicker()}>
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
              <div className={classes.popoverArrow} />
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
      "0px 9px 18px rgba(0, 0, 0, 0.09), 0px 6px 5px rgba(0, 0, 0, 0.05);",
    padding: theme.spacing(2),
    maxWidth: "600px",
    width: "100vw",
    marginTop: theme.typography.pxToRem(5),
    // Magic number for some color on color finesse
    border: "1px solid #f0f0f0",
  },
  trigger: {
    display: "inline-block",
    paddingTop: theme.typography.pxToRem(3),
    position: "relative",
  },
  arrowDownIcon: {
    color: theme.customColors.edluminSubText,
    cursor: "pointer",
    pointerEvents: "none",
    position: "absolute",
    right: theme.spacing(2),
    top: "50%",
    transform: "translateY(-50%)",
  },
  popoverArrow: {
    width: 0,
    height: 0,
    borderLeft: `${theme.typography.pxToRem(10)} solid transparent`,
    borderRight: `${theme.typography.pxToRem(10)} solid transparent`,
    borderBottom: `${theme.typography.pxToRem(10)} solid ${
      theme.customColors.sectionBorder
    }`,
    position: "absolute",
    top: "0",
    left: theme.typography.pxToRem(28),
    transform: `translateY(calc(-100% + ${theme.typography.pxToRem(5)}))`,

    "&:before": {
      display: "inline-block",
      content: "''",
      width: 0,
      height: 0,
      borderLeft: `${theme.typography.pxToRem(10)} solid transparent`,
      borderRight: `${theme.typography.pxToRem(10)} solid transparent`,
      borderBottom: `${theme.typography.pxToRem(10)} solid ${
        theme.customColors.white
      }`,
      position: "absolute",
      top: theme.typography.pxToRem(1),
      left: theme.typography.pxToRem(-10),
    },
  },
  label: {
    cursor: "pointer",
  },
  buttonMinWidth: {
    minWidth: theme.typography.pxToRem(280),
  },
  buttonStandardWidth: {
    width: "100%",
  },
  divStandardWidth: {
    display: "block",
    width: "100%",
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
