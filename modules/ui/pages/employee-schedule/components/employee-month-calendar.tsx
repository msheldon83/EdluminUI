import { makeStyles } from "@material-ui/core";
import {
  parseISO,
  isSameMonth,
  isSameDay,
  isEqual,
  isToday,
  startOfToday,
} from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import {
  ScheduleDate,
  CalendarScheduleDate,
} from "ui/components/employee/types";
import clsx from "clsx";

type Props = {
  date: string;
  onSelectDate: (dates: Date) => void;
  scheduleDates: CalendarScheduleDate[];
  selectedScheduleDates: CalendarScheduleDate[];
};

const makeFlagClassKey = (
  isClosed: boolean,
  isModified: boolean,
  isInservice: boolean,
  isNonWorkDay: boolean
): string => {
  if (!isClosed && !isModified && !isInservice && isNonWorkDay)
    return "nonWorkDay";
  const maybeWithCapital = (isClosed ? ["closed"] : [])
    .concat(isModified ? ["Modified"] : [])
    .concat(isInservice ? ["InService"] : [])
    .join("And");
  return maybeWithCapital.length == 0
    ? ""
    : maybeWithCapital[0].toLowerCase() + maybeWithCapital.substring(1);
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
              calendarDate.absences.length > 0 ? classes.absence : undefined,
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
  absence: {
    background: "radial-gradient(#050039 50%, transparent 50%)",
    color: theme.customColors.white,
  },
  nonWorkDay: {
    backgroundColor: "#E1E1E1",
    color: theme.customColors.black,

    "&:hover": {
      backgroundColor: "#E1E1E1",
      color: theme.customColors.black,
    },
  },
  closed: {
    backgroundColor: "#FF5555",
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: "#FF5555",
      color: theme.customColors.white,
    },
  },
  modified: {
    backgroundColor: "#FFCC01",
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: "#FFCC01",
      color: theme.customColors.white,
    },
  },
  inService: {
    backgroundColor: "#6471DF",
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: "#6471DF",
      color: theme.customColors.white,
    },
  },
  closedAndModified: {
    background: "linear-gradient(to bottom right, #FF5555 50%, #FFCC01 50%)",
    color: theme.customColors.white,

    "&:hover": {
      background: "linear-gradient(to bottom right, #FF5555 50%, #FFCC01 50%)",
      color: theme.customColors.white,
    },
  },
  closedAndInService: {
    background: "linear-gradient(to bottom right, #FF5555 50%, #6471DF 50%)",
    color: theme.customColors.white,

    "&:hover": {
      background: "linear-gradient(to bottom right, #FF5555 50%, #6471DF 50%)",
      color: theme.customColors.white,
    },
  },
  modifiedAndInService: {
    background: "linear-gradient(to bottom right, #FFCC01 50%, #6471DF 50%)",
    color: theme.customColors.white,

    "&:hover": {
      background: "linear-gradient(to bottom right, #FFCC01 50%, #6471DF 50%)",
      color: theme.customColors.white,
    },
  },
  closedAndModifiedAndInService: {
    background: `radial-gradient(#FF5555 50%, transparent 50%),
                 linear-gradient(to bottom right, #FFCC01 50%, #6471DF 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `radial-gradient(#FF5555 50%, transparent 50%),
                  linear-gradient(to bottom right, #FFCC01 50%, #6471DF 50%)`,
      color: theme.customColors.white,
    },
  },
}));
