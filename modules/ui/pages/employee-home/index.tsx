import { makeStyles, useTheme } from "@material-ui/styles";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { PageTitle } from "ui/components/page-title";
import { ScheduledAbsences } from "./components/scheduled-absences";
import { Grid } from "@material-ui/core";
import { QuickAbsenceCreate } from "./components/quick-absence-create";
import { ScheduleCalendar } from "./components/schedule-calendar";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useGetEmployee } from "reference-data/employee";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeAbsenceSchedule } from "./graphql/get-employee-absence-schedule.gen";
import { DayPart, Absence } from "graphql/server-types.gen";
import { parseISO, format } from "date-fns";

type Props = {};

export const EmployeeHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const employee = useGetEmployee();
  const currentSchoolYear = useCurrentSchoolYear(employee?.orgId?.toString());

  // Account for the 5 week calendar going back a little
  const startDate = currentSchoolYear?.startDate;
  const endDate = currentSchoolYear?.endDate;

  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: employee?.id,
      fromDate: startDate,
      toDate: endDate,
    },
    skip: !employee || !startDate || !endDate,
  });

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

  console.log(employeeAbsenceDetails);

  const cancelAbsence = async () => {};

  return (
    <>
      <PageTitle title={t("Home")} />
      <Grid container spacing={4}>
        <Grid item md={6} xs={12}>
          <QuickAbsenceCreate />
        </Grid>
        <Grid item md={6} xs={12}>
          <ScheduleCalendar
            absences={employeeAbsenceDetails}
            disabledDates={[]}
          />
        </Grid>
        <Grid item xs={12}>
          <ScheduledAbsences
            absences={employeeAbsenceDetails}
            cancelAbsence={cancelAbsence}
          />
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
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
  substitute?: {
    name: string;
    phoneNumber?: string | null | undefined;
  };
};
