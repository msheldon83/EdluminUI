import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { EmployeeAbsenceDetail } from "..";

type Props = {
  absences: EmployeeAbsenceDetail[];
  disabledDates: Date[];
};

export const ScheduleCalendar: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Section>
      <SectionHeader title={t("Upcoming schedule")} />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({}));
