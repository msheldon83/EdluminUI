import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { makeStyles } from "@material-ui/core";
import { ScheduledAbsences } from "ui/components/employee/components/scheduled-absences";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useMemo } from "react";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { isAfter } from "date-fns";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";

type Props = {
  employeeId: string;
  orgId: string;
};

export const UpcomingAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  //const classes = useStyles();
  const currentSchoolYear = useCurrentSchoolYear(props.orgId.toString());
  const startDate = useMemo(() => new Date(), []);
  const endDate = currentSchoolYear?.endDate;
  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: props.employeeId,
      fromDate: startDate,
      toDate: endDate,
    },
  });

  const absences =
    getAbsenceSchedule.state === "LOADING" ||
    getAbsenceSchedule.state === "UPDATING"
      ? []
      : (getAbsenceSchedule.data?.employee
          ?.employeeAbsenceSchedule as GetEmployeeAbsenceSchedule.EmployeeAbsenceSchedule[]);

  const employeeAbsenceDetails = GetEmployeeAbsenceDetails(absences);

  return (
    <>
      <Section>
        <SectionHeader
          title={t("Upcoming Absences")}
          action={{
            text: t("View All"),
            visible: true,
            execute: () => {
              const editSettingsUrl = "/"; //TODO figure out the URL for editing
              history.push(editSettingsUrl);
            },
          }}
        />
        <ScheduledAbsences
          absences={employeeAbsenceDetails
            .filter((a: EmployeeAbsenceDetail) =>
              isAfter(a.startTimeLocal, startDate)
            )
            .slice(0, 5)}
          isLoading={
            getAbsenceSchedule.state === "LOADING" ||
            getAbsenceSchedule.state === "UPDATING"
          }
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
