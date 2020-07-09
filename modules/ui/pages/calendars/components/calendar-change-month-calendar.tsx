import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { useMemo } from "react";
import * as DateFns from "date-fns";
import clsx from "clsx";

type Props = {
  date: string;
  calendarChangeDates: Date[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

export const CalendarChangeMonthCalendar: React.FC<Props> = props => {
  const classes = useStyles();
  const parsedDate = useMemo(() => DateFns.parseISO(props.date), [props.date]);
  const className = classes.event;

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

  const calendarChangeDates = useMemo(() => {
    const days = checkDays
      ? props.calendarChangeDates.map(d => ({
          date: d,
          buttonProps: { className: checkSelected(d) },
        }))
      : props.calendarChangeDates.map(d => ({
          date: d,
          buttonProps: { className },
        }));
    const today = days.find(d => DateFns.isToday(d.date));
    if (today) {
      today.buttonProps.className += ` ${classes.today}`;
    } else {
      days.push({
        date: DateFns.startOfToday(),
        buttonProps: { className: classes.today },
      });
    }
    return days;
  }, [
    props.calendarChangeDates,
    className,
    checkDays,
    checkSelected,
    classes.today,
  ]);

  return (
    <>
      <div className={classes.calendar}>
        <SingleMonthCalendar
          currentMonth={parsedDate}
          customDates={calendarChangeDates}
          onSelectDate={props.onSelectDate}
          className={classes.calendarSize}
        />
      </div>
    </>
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
  event: {
    backgroundColor: theme.customColors.sky,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.customColors.sky,
      color: theme.customColors.white,
    },
  },
  today: {
    border: "2px solid black",
  },
}));
