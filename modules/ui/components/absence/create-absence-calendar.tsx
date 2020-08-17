import { makeStyles } from "@material-ui/styles";
import { isSameDay, isToday } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { CustomCalendar } from "../form/custom-calendar";
import { useEmployeeScheduleDates } from "helpers/absence/use-employee-schedule-dates";
import clsx from "clsx";
import { makeFlagClassKey } from "../employee/helpers";

type Props = {
  selectedAbsenceDates: Date[];
  employeeId: string;
  currentMonth: Date;
} & (
  | { monthNavigation: false }
  | {
      monthNavigation: true;
      onMonthChange: (date: Date) => void;
      onSelectDates: (dates: Array<Date>) => void;
    }
);

export const CreateAbsenceCalendar: React.FC<Props> = props => {
  const { selectedAbsenceDates, currentMonth } = props;
  const classes = useStyles();
  const employeeScheduleDates = useEmployeeScheduleDates(
    props.employeeId,
    currentMonth
  );

  const styledDates = useMemo(
    () =>
      employeeScheduleDates.map((calendarDate): {
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
          selectedAbsenceDates.find(s => isSameDay(s, calendarDate.date))
            ? classes.selectedAbsenceDate
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
            calendarDate.absences.length > 0 ? classes.absenceToken : undefined,
        };
      }),
    [classes, employeeScheduleDates, selectedAbsenceDates]
  );

  const handleSelectDates = (dates: Date[]) => {
    // This component does not allow date selection if there is no month selection
    if (!props.monthNavigation) {
      return;
    }

    /*
      If more than one date is selected, the first date is dropped because
      that one is already marked as selected in the state management. This keeps
      it from being toggled off for this multi-date selection
    */
    const [initialDate, ...restOfDates] = dates;

    props.onSelectDates(dates.length > 1 ? restOfDates : [initialDate]);
  };

  const { monthNavigation, ...calendarProps } = props;

  return (
    <CustomCalendar
      variant="month"
      month={currentMonth}
      previousMonthNavigation={monthNavigation}
      nextMonthNavigation={monthNavigation}
      {...calendarProps}
      onSelectDates={handleSelectDates}
      customDates={styledDates}
    />
  );
};

const useStyles = makeStyles(theme => ({
  absenceToken: {
    background: `radial-gradient(${theme.calendar.absence.existingAbsence} 50%, transparent 50%)`,
    color: theme.customColors.white,
  },
  nonWorkDay: {
    backgroundColor: theme.calendar.absence.disabled,
    color: theme.palette.text.disabled,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.absence.disabled,
      color: theme.palette.text.disabled,
    },
  },
  absence: {
    backgroundColor: theme.calendar.absence.existingAbsence,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.calendar.absence.existingAbsence,
      color: theme.customColors.white,
    },
  },
  closed: {
    backgroundColor: theme.calendar.absence.closed,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.absence.closed,
    },
  },
  modified: {
    backgroundColor: theme.calendar.absence.modified,

    "&:hover": {
      backgroundColor: theme.calendar.absence.modified,
    },
  },
  inService: {
    backgroundColor: theme.calendar.absence.inservice,

    "&:hover": {
      backgroundColor: theme.calendar.absence.inservice,
    },
  },
  closedAndModified: {
    background: `linear-gradient(to bottom right, ${theme.calendar.absence.closed} 50%, ${theme.calendar.absence.modified} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.absence.closed} 50%, ${theme.calendar.absence.modified} 50%)`,
      color: theme.customColors.white,
    },
  },
  closedAndInService: {
    background: `linear-gradient(to bottom right, ${theme.calendar.absence.closed} 50%, ${theme.calendar.absence.inservice} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.absence.closed} 50%, ${theme.calendar.absence.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
  modifiedAndInService: {
    background: `linear-gradient(to bottom right, ${theme.calendar.absence.modified} 50%, ${theme.calendar.absence.inservice} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.absence.modified} 50%, ${theme.calendar.absence.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
  closedAndModifiedAndInService: {
    background: `radial-gradient(${theme.calendar.absence.closed} 50%, transparent 50%),
                 linear-gradient(to bottom right, ${theme.calendar.absence.modified} 50%, ${theme.calendar.absence.inservice} 50%)`,
    color: theme.customColors.white,

    "&:hover": {
      background: `radial-gradient(${theme.calendar.absence.closed} 50%, transparent 50%),
                  linear-gradient(to bottom right, ${theme.calendar.absence.modified} 50%, ${theme.calendar.absence.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },

  selectedAbsenceDate: {
    backgroundColor: theme.customColors.edluminSlate,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.customColors.edluminSlate,
      color: theme.customColors.white,
    },
  },
  today: {
    border: "solid black 1px",
    fontWeight: "bold",
  },
}));
