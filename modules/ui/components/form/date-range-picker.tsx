import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import Fade from "@material-ui/core/Fade";
import Popper from "@material-ui/core/Popper";
import addMonth from "date-fns/addMonths";
import { DateInput } from "./date-input";
import { CustomCalendar as Calendar } from "./custom-calendar";
import { SelectNew as Select } from "./select-new";

export const DateRangePicker = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  const [month, setMonth] = React.useState(new Date());
  const [showPopover, setShowPopover] = React.useState(true);

  const buttonRef = React.useRef(document.createElement("button"));

  const handleMonthChange = (month: Date) => {
    setMonth(month);
  };

  return (
    <>
      <button ref={buttonRef} onClick={() => setShowPopover(!showPopover)}>
        Open
      </button>
      <Popper
        transition
        anchorEl={buttonRef.current}
        open={showPopover}
        placement="bottom-start"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <div>
              <ClickAwayListener
                mouseEvent="onMouseDown"
                onClickAway={() => setShowPopover(false)}
              >
                <Paper className={classes.popoverContainer} elevation={0}>
                  <div className={classes.dateRangeSelectContainer}>
                    <Select
                      options={[]}
                      label={t("Date Range")}
                      multiple={false}
                    />
                  </div>
                  <div className={classes.dateInputContainer}>
                    <DateInput
                      className={classes.startDateInput}
                      onChange={(date: string) => {}}
                      onValidDate={(date: Date) => {}}
                      label={t("From")}
                    />

                    <DateInput
                      className={classes.endDateInput}
                      onChange={(date: string) => {}}
                      onValidDate={(date: Date) => {}}
                      label={t("To")}
                    />
                  </div>

                  <div className={classes.calendarsContaienr}>
                    <div className={classes.startCalender}>
                      <Calendar
                        contained={false}
                        month={month}
                        variant="month"
                        previousMonthNavigation
                        onMonthChange={handleMonthChange}
                      />
                    </div>
                    <div className={classes.endCalendar}>
                      <Calendar
                        contained={false}
                        month={addMonth(month, 1)}
                        variant="month"
                        nextMonthNavigation
                        onMonthChange={handleMonthChange}
                      />
                    </div>
                  </div>
                  <div className={classes.actions}>
                    <div className={classes.cancelButton}>
                      <Button variant="outlined">Cancel</Button>
                    </div>
                    <div>
                      <Button variant="contained">Apply</Button>
                    </div>
                  </div>
                </Paper>
              </ClickAwayListener>
            </div>
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
  dateRangeSelectContainer: {
    paddingBottom: theme.spacing(1.5),
  },
  dateInputContainer: {
    display: "flex",
    paddingBottom: theme.spacing(2),
  },

  calendarsContaienr: {
    border: `1px solid ${theme.customColors.edluminSubText}`,
    borderRadius: theme.typography.pxToRem(4),
    display: "flex",
    marginBottom: theme.spacing(2),
    padding: theme.spacing(3),
  },
  startCalender: {
    flex: "1 0 auto",
    marginRight: theme.spacing(2),
  },
  endCalendar: {
    flex: "1 0 auto",
  },
  startDateInput: {
    marginRight: theme.spacing(2),
  },
  endDateInput: {},
  actions: {
    alignItems: "flex-end",
    display: "flex",
  },
  cancelButton: {
    flex: "1 0 auto",
  },
}));
