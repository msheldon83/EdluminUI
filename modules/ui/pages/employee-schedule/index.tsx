import * as React from "react";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { Link } from "react-router-dom";
import { EmployeeCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { Grid, Button, Divider } from "@material-ui/core";
import { useGetEmployee } from "reference-data/employee";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useMemo, useState } from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { useSnackbar } from "hooks/use-snackbar";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { ScheduledAbsences } from "ui/components/employee/components/scheduled-absences";
import { CalendarView } from "./components/calendar-view";
import { parseISO } from "date-fns";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import {
  EmployeeScheduleRoute,
  EmployeeScheduleListViewRoute,
  EmployeeScheduleCalendarViewRoute,
} from "ui/routes/employee-schedule";

type Props = {
  view: "list" | "calendar";
};

export const EmployeeSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { openSnackbar } = useSnackbar();
  const createAbsenceParams = useRouteParams(EmployeeCreateAbsenceRoute);
  const params = useRouteParams(EmployeeScheduleRoute);
  const employee = useGetEmployee();

  // TODO: Switch to using School Year dropdown
  const currentSchoolYear = useCurrentSchoolYear(employee?.orgId?.toString());
  // TODO: Dropdown filter to start with Today or the beginning of the School year (default of Today)
  const startDateOfToday = useMemo(() => new Date(), []);
  const startDateOfSchoolYear = useMemo(
    () =>
      currentSchoolYear ? parseISO(currentSchoolYear?.startDate) : new Date(),
    [currentSchoolYear]
  );
  const endDate = useMemo(
    () =>
      currentSchoolYear ? parseISO(currentSchoolYear?.endDate) : new Date(),
    [currentSchoolYear]
  );

  const [queryStartDate, setQueryStartDate] = useState(startDateOfToday);

  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: employee?.id ?? "0",
      fromDate:
        props.view === "calendar" ? startDateOfSchoolYear : queryStartDate,
      toDate: endDate,
    },
    skip: !employee || !endDate,
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

  if (!currentSchoolYear) {
    return <></>;
  }

  return (
    <>
      <Grid container justify="space-between" alignItems="center">
        <Grid item>
          <PageTitle title={t("My schedule")} />
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            component={Link}
            to={EmployeeCreateAbsenceRoute.generate(createAbsenceParams)}
          >
            {t("Create Absence")}
          </Button>
        </Grid>
      </Grid>
      <Section className={classes.container}>
        <Grid container>
          <Grid item xs={12} className={classes.filters}>
            <div className={classes.scheduleHeader}>
              <ScheduleHeader
                view={props.view}
                today={startDateOfToday}
                beginningOfSchoolYear={startDateOfSchoolYear}
                endOfSchoolYear={endDate}
                startDate={queryStartDate}
                setStartDate={setQueryStartDate}
              />
            </div>
            <div>
              <ScheduleViewToggle
                view={props.view}
                listViewRoute={EmployeeScheduleListViewRoute.generate(params)}
                calendarViewRoute={EmployeeScheduleCalendarViewRoute.generate(
                  params
                )}
              />
            </div>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {props.view === "list" && (
            <Grid item xs={12} className={classes.listContent}>
              <ScheduledAbsences
                absences={employeeAbsenceDetails}
                cancelAbsence={cancelAbsence}
                isLoading={
                  getAbsenceSchedule.state === "LOADING" ||
                  getAbsenceSchedule.state === "UPDATING"
                }
              />
            </Grid>
          )}
          {props.view === "calendar" && (
            <Grid item xs={12}>
              <div className={classes.calendarContent}>
                <CalendarView
                  employeeId={employee?.id}
                  startDate={startDateOfSchoolYear}
                  endDate={endDate}
                  absences={employeeAbsenceDetails}
                  cancelAbsence={cancelAbsence}
                />
              </div>
            </Grid>
          )}
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: 0,
  },
  filters: {
    padding: theme.spacing(3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  scheduleHeader: {
    display: "flex",
  },
  listContent: {
    padding: theme.spacing(3),
  },
  calendarContent: {
    padding: theme.spacing(),
  },
}));
