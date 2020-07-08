import { makeStyles } from "@material-ui/core";
import * as DateFns from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";

type Props = {
  date: string;
  onSelectDate: (date: Date) => void;
  assignmentDates: Date[];
  selectedDate: Date;
  unavailableDates: Date[];
  availableBeforeDates: Date[];
  availableAfterDates: Date[];
};

export const AssignmentCalendar: React.FC<Props> = props => {
  const classes = useStyles();
  const parsedDate = useMemo(() => DateFns.parseISO(props.date), [props.date]);

  const checkDays = useMemo(
    () => DateFns.isSameMonth(parsedDate, props.selectedDate),
    [parsedDate, props.selectedDate]
  );

  const checkSelected = (d: Date, className: string) => {
    if (DateFns.isSameDay(d, props.selectedDate)) {
      return classes.selected;
    } else {
      return className;
    }
  };

  const unavailableDates = checkDays
    ? props.unavailableDates.map(d => ({
        date: d,
        buttonProps: { className: checkSelected(d, classes.unavailableDate) },
      }))
    : props.unavailableDates.map(d => ({
        date: d,
        buttonProps: { className: classes.unavailableDate },
      }));

  const availableBeforeDates = checkDays
    ? props.availableBeforeDates.map(d => ({
        date: d,
        buttonProps: {
          className: checkSelected(d, classes.availableBeforeDate),
        },
      }))
    : props.availableBeforeDates.map(d => ({
        date: d,
        buttonProps: { className: classes.availableBeforeDate },
      }));

  const availableAfterDates = checkDays
    ? props.availableAfterDates.map(d => ({
        date: d,
        buttonProps: {
          className: checkSelected(d, classes.availableAfterDate),
        },
      }))
    : props.availableAfterDates.map(d => ({
        date: d,
        buttonProps: { className: classes.availableAfterDate },
      }));

  const assignmentDates = checkDays
    ? props.assignmentDates.map(d => ({
        date: d,
        buttonProps: { className: checkSelected(d, classes.assignment) },
      }))
    : props.assignmentDates.map(d => ({
        date: d,
        buttonProps: { className: classes.assignment },
      }));

  const disabledDates = unavailableDates
    .concat(availableBeforeDates)
    .concat(availableAfterDates)
    .filter(
      d => !props.assignmentDates.find(ad => DateFns.isSameDay(ad, d.date))
    );

  const customDates = disabledDates.concat(assignmentDates);

  // If the selected day is not in customDates, add an entry for it
  checkDays &&
    customDates.push({
      date: props.selectedDate,
      buttonProps: { className: classes.selected },
    });

  const today = customDates.find(d => DateFns.isToday(d.date));
  if (today) {
    today.buttonProps.className += ` ${classes.today}`;
  } else {
    customDates.push({
      date: DateFns.startOfToday(),
      buttonProps: { className: classes.today },
    });
  }

  return (
    <div className={classes.calendar}>
      <SingleMonthCalendar
        currentMonth={parsedDate}
        customDates={customDates}
        onSelectDate={props.onSelectDate}
        className={classes.calendarSize}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    display: "flex",
    padding: theme.spacing(1),
  },
  calendarSize: {
    minWidth: theme.typography.pxToRem(300),
  },
  selected: {
    backgroundColor: theme.customColors.blueHover,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.customColors.blueHover,
      color: theme.customColors.white,
    },
  },
  assignment: {
    backgroundColor: theme.customColors.sky,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.customColors.sky,
      color: theme.customColors.white,
    },
  },
  unavailableDate: {
    backgroundColor: theme.customColors.medLightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  availableBeforeDate: {
    background: `linear-gradient(to left top, ${theme.customColors.medLightGray}, ${theme.customColors.white} 65%)`,
  },
  availableAfterDate: {
    background: `linear-gradient(to right bottom, ${theme.customColors.medLightGray}, ${theme.customColors.white} 65%)`,
  },
  today: {
    border: "2px solid black",
  },
}));
