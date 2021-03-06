import { makeStyles } from "@material-ui/core";
import * as DateFns from "date-fns";
import * as React from "react";
import { useCallback, useMemo } from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import clsx from "clsx";

type Props = {
  date: string;
  onSelectDate: (date: Date) => void;
  assignmentDates: Date[];
  selectedDate: Date;
  unavailableDates: Date[];
  availableBeforeDates: Date[];
  availableAfterDates: Date[];
};

export const AssignmentCalendar: React.FC<Props> = ({
  assignmentDates,
  unavailableDates,
  availableBeforeDates,
  availableAfterDates,
  selectedDate,
  ...props
}) => {
  const classes = useStyles();
  const parsedDate = useMemo(() => DateFns.parseISO(props.date), [props.date]);

  const checkDays = useMemo(
    () =>
      DateFns.isSameMonth(parsedDate, selectedDate) ||
      DateFns.isThisMonth(parsedDate),
    [parsedDate, selectedDate]
  );

  const simpleDecorate = (className: string) => (date: Date) => ({
    date,
    buttonProps: { className },
  });

  const complexDecorate = useMemo(
    () =>
      checkDays
        ? (className: string) => (date: Date) => ({
            date,
            buttonProps: {
              className: clsx(
                className,
                DateFns.isSameDay(date, selectedDate)
                  ? classes.selected
                  : DateFns.isToday(date)
                  ? classes.today
                  : undefined
              ),
            },
          })
        : undefined,
    [checkDays, selectedDate, classes]
  );

  const baseDates = useMemo(() => {
    const decorateDate = complexDecorate ?? simpleDecorate;
    return unavailableDates
      .map(decorateDate(classes.unavailableDate))
      .concat(
        availableBeforeDates.map(decorateDate(classes.availableBeforeDate))
      )
      .concat(availableAfterDates.map(decorateDate(classes.availableAfterDate)))
      .filter(d => !assignmentDates.some(ad => DateFns.isSameDay(ad, d.date)))
      .concat(assignmentDates.map(decorateDate(classes.assignment)));
  }, [
    complexDecorate,
    unavailableDates,
    availableBeforeDates,
    availableAfterDates,
    assignmentDates,
    classes,
  ]);

  const customDates = useMemo(
    () =>
      checkDays
        ? baseDates
            .concat(
              baseDates.some(({ date }) =>
                DateFns.isSameDay(date, selectedDate)
              )
                ? []
                : [
                    {
                      date: selectedDate,
                      buttonProps: { className: classes.selected },
                    },
                  ]
            )
            .concat(
              DateFns.isToday(selectedDate) ||
                baseDates.some(({ date }) => DateFns.isToday(date))
                ? []
                : [
                    {
                      date: DateFns.startOfToday(),
                      buttonProps: { className: classes.today },
                    },
                  ]
            )
        : baseDates,
    [checkDays, baseDates, selectedDate, classes]
  );

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
    border: "3px solid #373361",
  },
  assignment: {
    backgroundColor: "#373361",
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: "#373361",
      color: theme.customColors.white,
    },
  },
  unavailableDate: {
    backgroundColor: "#E1E1E1",
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: "#E1E1E1",
      color: theme.palette.text.disabled,
    },
  },
  availableBeforeDate: {
    background: `linear-gradient(to bottom right, transparent 50%, #E1E1E1 50%)`,
  },
  availableAfterDate: {
    background: `linear-gradient(to bottom right, #E1E1E1 50%, transparent 50%)`,
  },
  today: {
    border: "3px solid #4CC17C",
  },
}));
