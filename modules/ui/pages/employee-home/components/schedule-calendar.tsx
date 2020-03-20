import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { useMemo } from "react";
import { eachDayOfInterval } from "date-fns";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";

type Props = {
  startDate: Date;
  absences: EmployeeAbsenceDetail[];
  disabledDates: Date[];
};

export const ScheduleCalendar: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const absentDays = useMemo(() => {
    const days: Date[] = [];
    props.absences.forEach(a => {
      days.push(
        ...eachDayOfInterval({
          start: a.startDate,
          end: a.endDate,
        })
      );
    });
    return days;
  }, [props.absences]);

  const disabledDates = props.disabledDates.map(date => ({
    date,
    buttonProps: { className: classes.dateDisabled+ " dateDisabled" },
  }));

  const absenceDates = absentDays.map(date => ({
    date,
    buttonProps: { className: classes.absenceDate },
  }));

  const customDates = disabledDates.concat(absenceDates);

  return (
    <Section className={classes.container}>
      <SectionHeader title={t("Upcoming schedule")} />
      <CustomCalendar month={props.startDate} customDates={customDates} />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: 0,
  },
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  absenceDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
}));
