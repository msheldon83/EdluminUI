import { makeStyles } from "@material-ui/core";
import {
  parseISO,
  isSameMonth,
  isSameDay,
  isToday,
  startOfToday,
} from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { CalendarScheduleDate } from "ui/components/employee/types";
import clsx from "clsx";
import { makeFlagClassKey } from "ui/components/employee/helpers";

type Props = {
  date: string;
  onSelectDate: (dates: Date) => void;
  scheduleDates: CalendarScheduleDate[];
  selectedScheduleDates: CalendarScheduleDate[];
};

export const EmployeeMonthCalendar: React.FC<Props> = props => {
  const classes = useStyles();
  const parsedDate = useMemo(() => parseISO(props.date), [props.date]);

  const selectedDate = useMemo(() => props.selectedScheduleDates[0], [
    props.selectedScheduleDates,
  ]);
  const checkDays = useMemo(
    () => selectedDate && isSameMonth(parsedDate, selectedDate.date),
    [parsedDate, selectedDate]
  );

  const inputDates = props.scheduleDates;

  const styledDates = useMemo(
    () =>
      inputDates
        .map((calendarDate): {
          date: Date;
          buttonProps: { className: string };
          timeClass?: string;
        } => {
          const className = clsx(
            classes[
              makeFlagClassKey(
                calendarDate.absences.length > 0,
                calendarDate.closedDays.length > 0,
                calendarDate.modifiedDays.length > 0 ||
                  calendarDate.contractInstructionalDays.length > 0,
                calendarDate.inServiceDays.length > 0,
                calendarDate.nonWorkDays.length > 0
              ) as keyof typeof classes
            ],
            selectedDate && isSameDay(calendarDate.date, selectedDate.date)
              ? classes.selected
              : isToday(calendarDate.date)
              ? classes.today
              : undefined
          );
          return {
            date: calendarDate.date,
            buttonProps: {
              className,
            },
            timeClass:
              calendarDate.absences.length > 0
                ? classes.absenceToken
                : undefined,
          };
        })
        .concat(
          !selectedDate ||
            (checkDays &&
              inputDates.some(({ date }) => isSameDay(date, selectedDate.date)))
            ? []
            : [
                {
                  date: selectedDate.date,
                  buttonProps: { className: classes.selected },
                },
              ]
        )
        .concat(
          (selectedDate && isToday(selectedDate.date)) ||
            inputDates.some(({ date }) => isToday(date))
            ? []
            : [
                {
                  date: startOfToday(),
                  buttonProps: { className: classes.today },
                },
              ]
        ),
    [classes, inputDates, selectedDate, checkDays]
  );

  return (
    <div className={classes.calendar}>
      <SingleMonthCalendar
        currentMonth={parsedDate}
        customDates={styledDates}
        onSelectDate={props.onSelectDate}
        className={classes.calendarSize}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    display: "flex",
  },
  calendarSize: {
    minWidth: theme.typography.pxToRem(300),
  },
  selected: {
    border: "3px solid #373361",
  },
  today: {
    border: "3px solid #4CC17C",
  },
  absenceToken: {
    background: `radial-gradient(${theme.calendar.selected} 50%, transparent 50%)`,
    color: theme.customColors.white,
  },
  nonWorkDay: {
    backgroundColor: theme.calendar.disabled,
    color: theme.customColors.black,

    "&:hover": {
      backgroundColor: theme.calendar.disabled,
      color: theme.customColors.black,
    },
  },
  absence: {
    backgroundColor: theme.calendar.selected,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.calendar.selected,
      color: theme.customColors.white,
    },
  },
  closed: {
    backgroundColor: theme.calendar.closed,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.calendar.closed,
      color: theme.customColors.white,
    },
  },
  modified: {
    backgroundColor: theme.calendar.modified,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.calendar.modified,
      color: theme.customColors.white,
    },
  },
  inService: {
    backgroundColor: theme.calendar.inservice,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.calendar.inservice,
      color: theme.customColors.white,
    },
  },
  closedAndModified: {
    background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.modified} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.modified} 50%)`,
      color: theme.customColors.white,
    },
  },
  closedAndInService: {
    background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.inservice} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
  modifiedAndInService: {
    background: `linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
  closedAndModifiedAndInService: {
    background: `radial-gradient(${theme.calendar.closed} 50%, transparent 50%),
                 linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `radial-gradient(${theme.calendar.closed} 50%, transparent 50%),
                  linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
}));
