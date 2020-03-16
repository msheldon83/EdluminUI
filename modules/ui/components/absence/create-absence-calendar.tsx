import { makeStyles } from "@material-ui/styles";
import { isSameDay } from "date-fns";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import * as React from "react";
import { useMemo } from "react";
import { CustomCalendar } from "../form/custom-calendar";
import { getCannotCreateAbsenceDates } from "./helpers";

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
  const disabledDateObjs = useEmployeeDisabledDates(
    props.employeeId,
    currentMonth
  );

  const customDatesDisabled = useMemo(
    () =>
      getCannotCreateAbsenceDates(disabledDateObjs).map(date => {
        return {
          date,
          buttonProps: { className: classes.dateDisabled + " dateDisabled" },
        };
      }),
    [disabledDateObjs, classes.dateDisabled + " dateDisabled"]
  );

  const customExistingAbsenceDates = useMemo(
    () =>
      disabledDateObjs
        .filter(d => d.type === "absence")
        .map(d => d.date)
        // remove if it is a selected date
        .filter(d => !selectedAbsenceDates.find(sd => isSameDay(sd, d)))
        .map(date => {
          return {
            date,
            buttonProps: { className: classes.existingDate },
          };
        }),
    [disabledDateObjs, classes.existingDate, selectedAbsenceDates]
  );

  const customSelectedAbsenceDates = useMemo(
    () =>
      selectedAbsenceDates.map(date => {
        return {
          date,
          buttonProps: { className: classes.selectedAbsenceDate },
        };
      }),
    [selectedAbsenceDates, classes.selectedAbsenceDate]
  );

  const customDates = useMemo(
    () =>
      customDatesDisabled
        .concat(customExistingAbsenceDates)
        .concat(customSelectedAbsenceDates),
    [
      customDatesDisabled,
      customExistingAbsenceDates,
      customSelectedAbsenceDates,
    ]
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

  return (
    <CustomCalendar
      variant="month"
      month={currentMonth}
      {...props}
      onSelectDates={handleSelectDates}
      customDates={customDates}
    />
  );
};

const useStyles = makeStyles(theme => ({
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  existingDate: {
    backgroundColor: theme.customColors.lightBlue,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightBlue,
      color: theme.palette.text.disabled,
    },
  },
  selectedAbsenceDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
}));
