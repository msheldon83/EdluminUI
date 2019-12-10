import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { ScheduledAbsences } from "./components/scheduled-absences";
import { Grid, Typography } from "@material-ui/core";
import { QuickAbsenceCreate } from "./components/quick-absence-create";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useGetEmployee } from "reference-data/employee";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import { GetEmployeeAbsenceSchedule } from "./graphql/get-employee-absence-schedule.gen";
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
import { DeleteAbsence } from "./graphql/delete-absence.gen";
import { useMemo } from "react";
import {
  GetEmployeeContractSchedule,
  GetEmployeeContractScheduleQuery,
  GetEmployeeContractScheduleQueryVariables,
} from "./graphql/get-employee-contract-schedule.gen";

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
  const employeeAbsenceDetails = absences.map(
    (
      a: Pick<
        Absence,
        | "id"
        | "details"
        | "startDate"
        | "endDate"
        | "numDays"
        | "totalDayPortion"
        | "startTimeLocal"
        | "endTimeLocal"
        | "vacancies"
      >
    ) => {
      const assignment =
        a.vacancies &&
        a.vacancies[0]?.details &&
        a.vacancies[0]?.details[0]?.assignment
          ? a.vacancies[0]?.details[0]?.assignment
          : undefined;

      return {
        id: a.id,
        absenceReason: a.details![0]!.reasonUsages![0]!.absenceReason!.name,
        startDate: parseISO(a.startDate),
        endDate: parseISO(a.endDate),
        numDays: Number(a.numDays),
        totalDayPortion: Number(a.totalDayPortion),
        dayPart: a.details![0]!.dayPartId!,
        startTime: format(parseISO(a.startTimeLocal), "h:mm a"),
        startTimeLocal: parseISO(a.startTimeLocal),
        endTime: format(parseISO(a.endTimeLocal), "h:mm a"),
        endTimeLocal: parseISO(a.endTimeLocal),
        subRequired: !!a.vacancies && a.vacancies.length > 0,
        substitute: assignment
          ? {
              name: `${assignment.employee!.firstName} ${
                assignment.employee!.lastName
              }`,
              phoneNumber: assignment.employee!.phoneNumber,
            }
          : undefined,
      };
    }
  );

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
          <ScheduledAbsences
            absences={employeeAbsenceDetails.filter(
              (a: EmployeeAbsenceDetail) => isAfter(a.startTimeLocal, today)
            )}
            cancelAbsence={cancelAbsence}
          />
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

export type EmployeeAbsenceDetail = {
  id: string;
  absenceReason: string;
  startDate: Date;
  endDate: Date;
  numDays: number;
  dayPart: DayPart;
  totalDayPortion: number;
  startTime: string;
  startTimeLocal: Date;
  endTime: string;
  endTimeLocal: Date;
  subRequired: boolean;
  substitute?: {
    name: string;
    phoneNumber?: string | null | undefined;
  };
};

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
