import { makeStyles } from "@material-ui/core";
import * as DateFns from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";

type Props = {
  userId?: string;
  date: string;
  onSelectDate: (date: Date) => void;
  assignmentDates: Date[];
  selectedDate: Date;
};

export const AssignmentCalendar: React.FC<Props> = props => {
  const classes = useStyles();
  const parsedDate = useMemo(() => DateFns.parseISO(props.date), [props.date]);

  const className = classes.assignment;
  const checkDays = useMemo(
    () => DateFns.isSameMonth(parsedDate, props.selectedDate),
    [parsedDate, props.selectedDate]
  );

  const checkSelected = useMemo(
    () => (d: Date) => {
      if (DateFns.isSameDay(d, props.selectedDate)) {
        return classes.selected;
      } else {
        return className;
      }
    },
    [props.selectedDate, classes, className]
  );

  const assignmentDates = useMemo(
    () =>
      checkDays
        ? props.assignmentDates.map(d => ({
            date: d,
            buttonProps: { className: checkSelected(d) },
          }))
        : props.assignmentDates.map(d => ({
            date: d,
            buttonProps: { className },
          })),
    [props.assignmentDates, className, checkDays, checkSelected]
  );

  // If the selected day is not in assignmentDates, add an entry for it
  checkDays &&
    assignmentDates.push({
      date: props.selectedDate,
      buttonProps: { className: classes.selected },
    });

  return (
    <div className={classes.calendar}>
      <SingleMonthCalendar
        currentMonth={parsedDate}
        customDates={assignmentDates}
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
  },
  assignment: {
    backgroundColor: theme.customColors.sky,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.customColors.sky,
      color: theme.customColors.white,
    },
  },
}));
