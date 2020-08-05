import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { useMemo } from "react";
import * as DateFns from "date-fns";
import { CalendarChangeDate } from "../types";
import clsx from "clsx";

type Props = {
  date: string;
  calendarChangeDates: CalendarChangeDate[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
};

const makeFlagClassKey = ({
  isClosed,
  isModified,
  isInservice,
}: {
  isClosed: boolean;
  isModified: boolean;
  isInservice: boolean;
}): string => {
  const maybeWithCapital = (isClosed ? ["closed"] : [])
    .concat(isModified ? ["Modified"] : [])
    .concat(isInservice ? ["InService"] : [])
    .join("And");
  return maybeWithCapital.length == 0
    ? ""
    : maybeWithCapital[0].toLowerCase() + maybeWithCapital.substring(1);
};

export const CalendarChangeMonthCalendar: React.FC<Props> = props => {
  const classes = useStyles();
  const parsedDate = useMemo(() => DateFns.parseISO(props.date), [props.date]);
  const inputDates = props.calendarChangeDates;

  const styledDates = useMemo(
    () =>
      inputDates
        .map(({ date, ...flags }) => {
          const flagClasses =
            classes[makeFlagClassKey(flags) as keyof typeof classes];
          return {
            date,
            buttonProps: {
              className: clsx(
                flagClasses,
                DateFns.isSameDay(date, props.selectedDate)
                  ? classes.selected
                  : DateFns.isToday(date)
                  ? classes.today
                  : undefined
              ),
            },
          };
        })
        .concat(
          inputDates.some(({ date }) => DateFns.isToday(date))
            ? []
            : [
                {
                  date: DateFns.startOfToday(),
                  buttonProps: { className: classes.today },
                },
              ]
        ),
    [inputDates, classes, props.selectedDate]
  );

  return (
    <>
      <div className={classes.calendar}>
        <SingleMonthCalendar
          currentMonth={parsedDate}
          customDates={styledDates}
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
    border: "3px solid #373361",
  },
  today: {
    border: "3px solid #4CC17C",
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
