import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { ScheduledAbsences } from "../../components/employee/components/scheduled-absences";
import { Grid, Typography } from "@material-ui/core";
import { QuickAbsenceCreate } from "./components/quick-absence-create";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useGetEmployee } from "reference-data/employee";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { DayPart, Absence, CalendarDayType } from "graphql/server-types.gen";
import {
  parseISO,
  format,
  startOfWeek,
  isAfter,
  addDays,
  startOfDay,
} from "date-fns";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle } from "graphql/hooks";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { useMemo } from "react";
import {
  GetEmployeeContractSchedule,
  GetEmployeeContractScheduleQuery,
  GetEmployeeContractScheduleQueryVariables,
} from "ui/components/employee/graphql/get-employee-contract-schedule.gen";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { Section } from "ui/components/section";

type Props = {};

export const EmployeeHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const employee = useGetEmployee();
  const currentSchoolYear = useCurrentSchoolYear(employee?.orgId?.toString());

  const startDate = useMemo(() => startOfWeek(new Date()), []);
  const today = useMemo(() => new Date(), []);
  const endDate = currentSchoolYear?.endDate;

  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: employee?.id ?? "0",
      fromDate: startDate,
      toDate: endDate,
    },
    skip: !employee || !endDate,
  });
  const getContractSchedule = useQueryBundle(GetEmployeeContractSchedule, {
    variables: {
      id: employee?.id ?? "0",
      fromDate: startDate,
      toDate: addDays(startDate, 45),
    },
    skip: !employee,
  });

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });

  const disabledDates = useMemo(
    () => computeDisabledDates(getContractSchedule),
    [getContractSchedule]
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

  const cancelAbsence = async (absenceId: string) => {
    const result = await deleteAbsence({
      variables: {
        absenceId: Number(absenceId),
      },
    });
    if (result) {
      await getAbsenceSchedule.refetch();
    }
  };

  return (
    <>
      <PageTitle title={t("Home")} withoutHeading />
      <Typography variant="h1">
        {`${t("Welcome")}, ${employee?.firstName}`}
      </Typography>
      <Grid container spacing={2} className={classes.content}>
        <Grid item md={6} xs={12}>
          <QuickAbsenceCreate />
        </Grid>
        <Grid item md={6} xs={12}>
          <ScheduleCalendar
            startDate={startDate}
            absences={employeeAbsenceDetails}
            disabledDates={disabledDates}
          />
        </Grid>
        <Grid item xs={12}>
          <Section>
            <ScheduledAbsences
              header={t("Scheduled absences")}
              absences={employeeAbsenceDetails.filter(
                (a: EmployeeAbsenceDetail) => isAfter(a.startTimeLocal, today)
              )}
              cancelAbsence={cancelAbsence}
              isLoading={
                getAbsenceSchedule.state === "LOADING" ||
                getAbsenceSchedule.state === "UPDATING"
              }
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

const computeDisabledDates = (
  queryResult: HookQueryResult<
    GetEmployeeContractScheduleQuery,
    GetEmployeeContractScheduleQueryVariables
  >
) => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates = new Set<Date>();
  queryResult.data.employee?.employeeContractSchedule?.forEach(contractDate => {
    switch (contractDate?.calendarDayTypeId) {
      case CalendarDayType.CancelledDay:
      case CalendarDayType.Invalid:
      case CalendarDayType.NonWorkDay: {
        const theDate = startOfDay(parseISO(contractDate.date));
        dates.add(theDate);
      }
    }
  });
  return [...dates];
};
