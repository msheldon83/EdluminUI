import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";
import { Button, Divider, Grid, Typography } from "@material-ui/core";
import { PageTitle } from "ui/components/page-title";
import { EmployeeCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { Link } from "react-router-dom";
import { Section } from "ui/components/section";
import { CalendarScheduleDate } from "ui/components/employee/types";
import { SelectedDateView } from "ui/pages/employee-schedule/components/selected-date-view";
import { useMemo, useState } from "react";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeAbsenceSchedule } from "ui/components/employee/graphql/get-employee-absence-schedule.gen";
import { parseISO } from "date-fns";
import { GetEmployeeAbsenceDetails } from "ui/components/employee/helpers";
import { ScheduledAbsences } from "ui/components/employee/components/scheduled-absences";
import { CalendarView } from "ui/pages/employee-schedule/components/calendar-view";
import { Can } from "ui/components/auth/can";
import { PermissionEnum } from "graphql/server-types.gen";
import { isWithinInterval } from "date-fns/esm";

type Props = {
  view: "list" | "calendar";
  employeeId: string;
  orgId: string;
  pageTitle: string | JSX.Element;
  cancelAbsence: (absenceId: string) => Promise<void>;
  hideAbsence?: (absenceId: string) => Promise<void>;
  calendarViewRoute: string;
  listViewRoute: string;
  actingAsEmployee: boolean;
  userCreatedDate: Date;
};

export const AbsenceSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const createAbsenceParams = useRouteParams(EmployeeCreateAbsenceRoute);

  const [selectedCalendarDates, setSelectedCalendarDates] = useState<
    CalendarScheduleDate[]
  >([]);

  const currentSchoolYear = useCurrentSchoolYear(props.orgId);

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

  React.useEffect(() => {
    setQueryEndDate(endDate);
  }, [endDate]);

  const calendarStartDate = useMemo(() => {
    return isWithinInterval(queryStartDate, {
      start: startDateOfSchoolYear,
      end: endDate,
    })
      ? startDateOfSchoolYear
      : queryStartDate;
  }, [endDate, queryStartDate, startDateOfSchoolYear]);

  const getAbsenceSchedule = useQueryBundle(GetEmployeeAbsenceSchedule, {
    variables: {
      id: props.employeeId,
      fromDate: props.view === "calendar" ? calendarStartDate : queryStartDate,
      toDate: queryEndDate,
      showDenied: props.actingAsEmployee,
    },
    skip: !endDate,
  });

  const absences =
    getAbsenceSchedule.state === "LOADING"
      ? []
      : (getAbsenceSchedule.data?.employee
          ?.employeeAbsenceSchedule as GetEmployeeAbsenceSchedule.EmployeeAbsenceSchedule[]);
  const employeeAbsenceDetails = useMemo(
    () => GetEmployeeAbsenceDetails(absences),
    [absences]
  );

  if (!currentSchoolYear) {
    return <></>;
  }

  const header =
    typeof props.pageTitle === "string" ? (
      <Grid item>
        <PageTitle title={t(props.pageTitle)} />
      </Grid>
    ) : (
      <Grid item xs={12}>
        {props.pageTitle}
      </Grid>
    );

  return (
    <div>
      <div className={classes.sticky}>
        <Grid container justify="space-between" alignItems="center">
          {header}
          {props.actingAsEmployee && (
            <Can do={[PermissionEnum.AbsVacSave]}>
              <Grid item>
                <Button
                  variant="outlined"
                  component={Link}
                  to={EmployeeCreateAbsenceRoute.generate(createAbsenceParams)}
                >
                  {t("Create Absence")}
                </Button>
              </Grid>
            </Can>
          )}
          {props.view === "calendar" && getAbsenceSchedule.state === "DONE" && (
            <Grid item xs={12}>
              <Section className={classes.absenceSection}>
                {selectedCalendarDates.length > 0 && (
                  <SelectedDateView
                    scheduleDates={selectedCalendarDates}
                    selectedDate={selectedCalendarDates[0].date}
                    cancelAbsence={props.cancelAbsence}
                    hideAbsence={props.hideAbsence}
                    orgId={props.orgId}
                    actingAsEmployee={props.actingAsEmployee}
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
            {getAbsenceSchedule.state === "DONE" && (
              <>
                <div className={classes.scheduleHeader}>
                  <ScheduleHeader
                    view={props.view}
                    today={startDateOfToday}
                    beginningOfCurrentSchoolYear={startDateOfSchoolYear}
                    endOfSchoolCurrentYear={endDate}
                    startDate={queryStartDate}
                    setStartDate={setQueryStartDate}
                    setEndDate={setQueryEndDate}
                    userCreatedDate={props.userCreatedDate}
                  />
                </div>
                <div>
                  <ScheduleViewToggle
                    view={props.view}
                    listViewRoute={props.listViewRoute}
                    calendarViewRoute={props.calendarViewRoute}
                  />
                </div>
              </>
            )}
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          {props.view === "list" && (
            <Grid item xs={12} className={classes.listContent}>
              <ScheduledAbsences
                absences={employeeAbsenceDetails}
                cancelAbsence={props.cancelAbsence}
                hideAbsence={props.hideAbsence}
                isLoading={false}
                orgId={props.orgId}
                actingAsEmployee={props.actingAsEmployee}
              />
            </Grid>
          )}
          {props.view === "calendar" && (
            <Grid item xs={12}>
              <div className={classes.calendarContent}>
                {getAbsenceSchedule.state === "DONE" && (
                  <CalendarView
                    selectedScheduleDates={selectedCalendarDates}
                    setSelectedScheduleDates={setSelectedCalendarDates}
                    employeeId={props.employeeId}
                    startDate={calendarStartDate}
                    endDate={queryEndDate}
                    absences={employeeAbsenceDetails}
                  />
                )}
                {getAbsenceSchedule.state !== "DONE" && (
                  <Grid container>
                    <Grid item xs={12} className={classes.loading}>
                      <Typography variant="h5">
                        {t("Loading Calendar")} ...
                      </Typography>
                    </Grid>
                  </Grid>
                )}
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
  loading: {
    padding: theme.spacing(3),
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: theme.typography.pxToRem(800),
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
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 400,
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
