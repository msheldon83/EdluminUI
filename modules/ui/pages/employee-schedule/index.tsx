import { Button, Divider, Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { parseISO } from "date-fns";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { useSnackbar } from "hooks/use-snackbar";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useGetEmployee } from "reference-data/employee";
import { ScheduledAbsences } from "ui/components/employee/components/scheduled-absences";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { ScheduleDate } from "ui/components/employee/types";
import { PageTitle } from "ui/components/page-title";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { Section } from "ui/components/section";
import { EmployeeCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import {
  EmployeeScheduleCalendarViewRoute,
  EmployeeScheduleListViewRoute,
  EmployeeScheduleRoute,
} from "ui/routes/employee-schedule";
import { QueryOrgUsers } from "../sub-home/graphql/get-orgusers.gen";
import { CalendarView } from "./components/calendar-view";
import { SelectedDateView } from "./components/selected-date-view";

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
  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });
  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

  const currentSchoolYear = useCurrentSchoolYear(employee?.orgId?.toString());

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
  const [queryEndDate, setQueryEndDate] = useState(endDate);

  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: employee?.id ?? "0",
      fromDate:
        props.view === "calendar" ? startDateOfSchoolYear : queryStartDate,
      toDate: queryEndDate,
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

  /* selected schedule dates moved here to support selected date view */
  const [selectedScheduleDates, setSelectedScheduleDates] = useState<
    ScheduleDate[]
  >([]);
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
    <div className={classes.pageContainer}>
      <div className={classes.sticky}>
        <Grid container justify="space-between" alignItems="center">
          <Grid item>
            <PageTitle title={t("My Schedule")} />
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
          {props.view === "calendar" && (
            <Grid item xs={12}>
              <Section className={classes.absenceSection}>
                {selectedScheduleDates && selectedScheduleDates.length > 0 && (
                  <SelectedDateView
                    scheduleDates={selectedScheduleDates}
                    selectedDate={selectedScheduleDates[0].date}
                    cancelAbsence={cancelAbsence}
                  />
                )}
              </Section>
            </Grid>
          )}
        </Grid>
      </div>

      <Section className={classes.container}>
        <Grid container>
          <Grid item xs={12} className={classes.filters}>
            <div className={classes.scheduleHeader}>
              <ScheduleHeader
                view={props.view}
                today={startDateOfToday}
                beginningOfCurrentSchoolYear={startDateOfSchoolYear}
                endOfSchoolCurrentYear={endDate}
                startDate={queryStartDate}
                setStartDate={setQueryStartDate}
                setEndDate={setQueryEndDate}
                userId={userId}
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
                  selectedScheduleDates={selectedScheduleDates}
                  setSelectedScheduleDates={setSelectedScheduleDates}
                  employeeId={employee?.id}
                  startDate={startDateOfSchoolYear}
                  endDate={endDate}
                  absences={employeeAbsenceDetails}
                />
              </div>
            </Grid>
          )}
        </Grid>
      </Section>
    </div>
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
  pageContainer: {
    display: "contents",
    overflow: "scroll",
    height: "100vh",
    position: "fixed",
  },
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: theme.customColors.appBackgroundGray,
    boxShadow: `0 ${theme.typography.pxToRem(16)} ${theme.typography.pxToRem(
      16
    )} -${theme.typography.pxToRem(13)} ${
      theme.customColors.appBackgroundGray
    }`,
    marginBottom: theme.spacing(3),
  },
  absenceSection: {
    padding: theme.spacing(1),
    marginBottom: 0,
  },
}));
