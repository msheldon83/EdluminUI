import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { FiveWeekCalendar } from "ui/components/form/five-week-calendar";
import { useMemo } from "react";
import { eachDayOfInterval } from "date-fns";
import { EmployeeAbsenceDetail } from "ui/components/employee/helpers";

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

  return (
    <Section className={classes.container}>
      <SectionHeader title={t("Upcoming schedule")} />
      <FiveWeekCalendar
        startDate={props.startDate}
        selectedDates={absentDays}
        disabledDates={props.disabledDates}
      />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: 0,
  },
}));
