import { Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { addDays, differenceInDays, parseISO, startOfWeek } from "date-fns";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { PermissionEnum } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useSnackbar } from "hooks/use-snackbar";
import * as React from "react";
import { useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useGetEmployee } from "reference-data/employee";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { ScheduledAbsences } from "../../components/employee/components/scheduled-absences";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { Can } from "ui/components/auth/can";
import { ShowErrors } from "ui/components/error-helpers";
import { HideAbsence } from "ui/components/employee/graphql/hide-absence.gen";
import { EmployeeQuickAbsenceCreate } from "../absence/create/employee-quick-create";
import { compact } from "lodash-es";

type Props = {};

export const EmployeeHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const employee = useGetEmployee();
  const currentSchoolYear = useCurrentSchoolYear(employee?.orgId?.toString());

  const startDate = useMemo(() => startOfWeek(new Date()), []);
  const endDate = useMemo(() => {
    if (!currentSchoolYear?.endDate) {
      return undefined;
    }

    return differenceInDays(parseISO(currentSchoolYear.endDate), startDate) < 45
      ? addDays(parseISO(currentSchoolYear.endDate), 45)
      : currentSchoolYear.endDate;
  }, [currentSchoolYear?.endDate, startDate]);

  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: employee?.id ?? "0",
      fromDate: startDate,
      toDate: endDate,
      showDenied: true,
    },
    skip: !employee || !endDate,
    fetchPolicy: "cache-and-network",
  });

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetEmployeeSchedule", "GetEmployeeAbsenceSchedule"],
  });

  const [hideAbsence] = useMutationBundle(HideAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
    refetchQueries: ["GetEmployeeSchedule", "GetEmployeeAbsenceSchedule"],
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

  const onHideAbsence = useCallback(
    async (absenceId: string) => {
      await hideAbsence({
        variables: {
          absenceId: absenceId,
        },
      });
    },
    [hideAbsence]
  );

  if (!employee && !currentSchoolYear) {
    return <></>;
  }

  const absences =
    getAbsenceSchedule.state === "LOADING" ||
    getAbsenceSchedule.state === "UPDATING"
      ? []
      : (getAbsenceSchedule.data?.employee
          ?.employeeAbsenceSchedule as GetEmployeeAbsenceSchedule.EmployeeAbsenceSchedule[]);
  const employeeAbsenceDetails = GetEmployeeAbsenceDetails(absences);

  return (
    <>
      <PageTitle title={t("Home")} withoutHeading />
      <Typography variant="h1">
        {`${t("Welcome")}, ${employee?.firstName}`}
      </Typography>
      <Grid container spacing={2} className={classes.content}>
        <Can do={[PermissionEnum.AbsVacSave]}>
          <Grid item md={6} xs={12}>
            <EmployeeQuickAbsenceCreate
              employeeId={employee!.id}
              organizationId={employee!.orgId}
              locationIds={compact(employee?.locations?.map(l => l?.id) ?? [])}
              positionId={employee?.primaryPosition?.id}
              positionTypeId={employee?.primaryPosition?.positionType?.id}
              defaultReplacementNeeded={
                employee?.primaryPosition?.needsReplacement
              }
            />
          </Grid>
        </Can>
        <Grid item md={6} xs={12}>
          <ScheduleCalendar startDate={startDate} employeeId={employee!.id} />
        </Grid>
        <Grid item xs={12}>
          <Section>
            <ScheduledAbsences
              header={t("Scheduled absences")}
              absences={employeeAbsenceDetails}
              cancelAbsence={cancelAbsence}
              hideAbsence={onHideAbsence}
              isLoading={
                getAbsenceSchedule.state === "LOADING" ||
                getAbsenceSchedule.state === "UPDATING"
              }
              actingAsEmployee={true}
            />
          </Section>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  content: {
    marginTop: theme.spacing(2),
  },
}));
