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
import { useRouteParams } from "ui/routes/definition";
import {
  PersonViewRoute,
  EmployeeAbsScheduleListViewRoute,
} from "ui/routes/people";
import { useIsAdmin } from "reference-data/is-admin";

type Props = {
  employeeId: string;
  orgId: string;
};

export const UpcomingAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  //const classes = useStyles();
  const params = useRouteParams(PersonViewRoute);
  const tempUserIsAdmin = useIsAdmin();
  const userIsAdmin = tempUserIsAdmin === null ? undefined : tempUserIsAdmin;
  const currentSchoolYear = useCurrentSchoolYear(props.orgId.toString());
  const startDate = useMemo(() => new Date(), []);
  const endDate = currentSchoolYear?.endDate;
  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: props.employeeId,
      fromDate: startDate,
      toDate: endDate,
    },
    skip: !endDate,
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
              const viewAllAbsencesScheduleUrl = EmployeeAbsScheduleListViewRoute.generate(
                params
              );
              history.push(viewAllAbsencesScheduleUrl);
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
          orgId={props.orgId}
          actingAsEmployee={false}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
