import { makeStyles } from "@material-ui/styles";
import { isSameDay } from "date-fns";
import { useEmployeeDisabledDates } from "helpers/absence/use-employee-disabled-dates";
import * as React from "react";
import { useMemo } from "react";
import { CustomCalendar } from "../form/custom-calendar";

type Props = {
  selectedAbsenceDates: Date[];
  employeeId: string;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onSelectDates: (dates: Array<Date>) => void;
};

export const CreateAbsenceCalendar: React.FC<Props> = props => {
  const { selectedAbsenceDates } = props;
  const classes = useStyles();
  const disabledDateObjs = useEmployeeDisabledDates(
    props.employeeId,
    props.currentMonth
  );

  const customDatesDisabled = useMemo(
    () =>
      disabledDateObjs
        .filter(dis => dis.type === "nonWorkDay")
        .map(d => d.date)
        .map(date => {
          return {
            date,
            buttonProps: { className: classes.dateDisabled },
          };
        }),
    [disabledDateObjs, classes.dateDisabled]
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

  return (
    <CustomCalendar
      monthNavigation
      variant="month"
      {...props}
      month={props.currentMonth}
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
