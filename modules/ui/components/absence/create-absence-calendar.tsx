import { makeStyles } from "@material-ui/styles";
import { isSameDay, isToday } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { CustomCalendar } from "../form/custom-calendar";
import { useEmployeeContractDates } from "helpers/absence/use-employee-contract-dates";

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
  const employeeContractDates = useEmployeeContractDates(
    props.employeeId,
    currentMonth
  );

  const customContractDates = useMemo(
    () =>
      employeeContractDates
        .filter(c => c.type !== "absence" && c.type !== "instructional")
        .map(c => {
          let className = classes.dateDisabled;
          switch (c.type) {
            case "closed":
              className = classes.closed;
              break;
            case "modified":
              className = classes.modified;
              break;
            case "inservice":
              className = classes.inservice;
              break;
          }

          return {
            date: c.date,
            buttonProps: { className },
          };
        }),
    [classes, employeeContractDates]
  );

  const customExistingAbsenceDates = useMemo(
    () =>
      employeeContractDates
        .filter(d => d.type === "absence")
        .map(d => d.date)
        // remove if it is a selected date
        .filter(d => !selectedAbsenceDates.find(sd => isSameDay(sd, d)))
        .map(date => {
          return {
            date,
            buttonProps: { className: classes.existingAbsenceDate },
          };
        }),
    [classes.existingAbsenceDate, employeeContractDates, selectedAbsenceDates]
  );

  const customSelectedAbsenceDates = useMemo(
    () =>
      selectedAbsenceDates.map(date => {
        return {
          date,
          buttonProps: { className: classes.selectedAbsenceDate },
        };
      }),
    [classes.selectedAbsenceDate, selectedAbsenceDates]
  );

  const customDates = useMemo(() => {
    const ranges = customSelectedAbsenceDates
      .concat(customExistingAbsenceDates)
      .concat(
        customContractDates.filter(
          c => !customExistingAbsenceDates.find(a => isSameDay(c.date, a.date))
        )
      );
    const todayIndex = ranges.findIndex(o => isToday(o.date));
    if (todayIndex === -1) {
      ranges.push({
        date: new Date(),
        buttonProps: { className: classes.today },
      });
    } else {
      const today = ranges[todayIndex];
      ranges[todayIndex] = {
        date: today.date,
        buttonProps: {
          className: `${classes.today} ${today.buttonProps.className}`,
        },
      };
    }
    return ranges;
  }, [
    classes.today,
    customContractDates,
    customExistingAbsenceDates,
    customSelectedAbsenceDates,
  ]);

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
      customDates={customDates}
    />
  );
};

const useStyles = makeStyles(theme => ({
  dateDisabled: {
    backgroundColor: theme.calendar.absence.disabled,
    color: theme.palette.text.disabled,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.absence.disabled,
      color: theme.palette.text.disabled,
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
  inservice: {
    backgroundColor: theme.calendar.absence.inservice,

    "&:hover": {
      backgroundColor: theme.calendar.absence.inservice,
    },
  },
  existingAbsenceDate: {
    backgroundColor: theme.calendar.absence.existingAbsence,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.calendar.absence.existingAbsence,
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
