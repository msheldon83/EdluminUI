import { addDays, differenceInDays, parseISO } from "date-fns";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { ScheduledAbsences } from "ui/components/employee/components/scheduled-absences";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useRouteParams } from "ui/routes/definition";
import {
  EmployeeAbsScheduleListViewRoute,
  PersonViewRoute,
} from "ui/routes/people";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";

type Props = {
  employeeId: string;
  orgId: string;
};

export const UpcomingAbsences: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const params = useRouteParams(PersonViewRoute);
  const { openSnackbar } = useSnackbar();

  const currentSchoolYear = useCurrentSchoolYear(props.orgId.toString());
  const startDate = useMemo(() => new Date(), []);
  const endDate = useMemo(() => {
    if (!currentSchoolYear?.endDate) {
      return undefined;
    }

    return differenceInDays(parseISO(currentSchoolYear.endDate), startDate) < 45
      ? addDays(parseISO(currentSchoolYear.endDate), 45)
      : currentSchoolYear.endDate;
  }, [startDate, currentSchoolYear]);
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

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetEmployeeAbsenceSchedule"],
  });

  const cancelAbsence = useCallback(
    async (absenceId: string) => {
      await deleteAbsence({
        variables: {
          absenceId: absenceId,
        },
      });
    },
    [deleteAbsence]
  );

  return (
    <Section>
      <SectionHeader
        title={t("Upcoming Absences")}
        actions={[
          {
            text: t("View All"),
            visible: true,
            execute: () => {
              const viewAllAbsencesScheduleUrl = EmployeeAbsScheduleListViewRoute.generate(
                params
              );
              history.push(viewAllAbsencesScheduleUrl);
            },
          },
        ]}
      />
      <ScheduledAbsences
        absences={employeeAbsenceDetails.slice(0, 5)}
        cancelAbsence={cancelAbsence}
        isLoading={
          getAbsenceSchedule.state === "LOADING" ||
          getAbsenceSchedule.state === "UPDATING"
        }
        orgId={props.orgId}
        actingAsEmployee={false}
      />
    </Section>
  );
};
