import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { makeStyles } from "@material-ui/styles";
import { Divider, Button, Grid } from "@material-ui/core";
import { Link } from "react-router-dom";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { Section } from "ui/components/section";
import { SubstituteAssignmentsCalendarView } from "./substitute-assignments-calendar";
import { NowViewingAssignmentsForDate } from "./substitute-assignments-calendar/now-viewing-assignments";
import { SubstituteAssignmentsListView } from "./substitute-assignments-list";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { useTranslation } from "react-i18next";
import { useMemo, useState } from "react";
import { getBeginningAndEndOfSchoolYear } from "ui/components/helpers";
import { numberOfMonthsInSchoolYear } from "ui/components/schedule/helpers";
import { addMonths, endOfMonth } from "date-fns";
import { SubAvailabilityRoute } from "ui/routes/sub-schedule";

type Props = {
  view: "list" | "calendar";
  pageTitle: string | JSX.Element;
  userId: string;
  listViewRoute: string;
  calendarViewRoute: string;
  userCreatedDate: Date;
  viewingAsAdmin: boolean;
  orgId?: string;
};

export const SubstituteAssignments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  /* the value for today will not change as long as the
      component is mounted. This could cause stale today
      values to be shown if the browser is on the same page
      over multiple days. */
  const today = useMemo(() => new Date(), []);

  const [beginningOfSchoolYear, endOfSchoolYear] = useMemo(() => {
    return getBeginningAndEndOfSchoolYear(today);
  }, [today]);

  const [queryStartDate, setQueryStartDate] = useState(today);
  const [queryEndDate, setQueryEndDate] = useState(endOfSchoolYear);

  /* selected date is used on the calendar view only. The state lives
     here because we need it to show the assignments for the selected date
     above the calendar view component */
  const [selectedDate, setSelectedDate] = useState(today);
  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );

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
    <>
      <div className={props.view === "calendar" ? classes.sticky : ""}>
        <Grid container justify="space-between" alignItems="center">
          {header}
          {!props.viewingAsAdmin && (
            <Grid item>
              <Button
                variant="outlined"
                component={Link}
                to={SubAvailabilityRoute.generate({})}
              >
                {t("Manage Availability")}
              </Button>
            </Grid>
          )}
        </Grid>
        {props.view === "calendar" && (
          <Section className={classes.assignments}>
            <NowViewingAssignmentsForDate
              date={selectedDate}
              userId={props.userId}
              isAdmin={props.viewingAsAdmin}
              orgId={props.orgId}
            />
          </Section>
        )}
      </div>

      <Section className={classes.section}>
        <div className={classes.itemContainer}>
          <div className={classes.item}>
            <ScheduleHeader
              view={props.view}
              today={today}
              beginningOfCurrentSchoolYear={beginningOfSchoolYear}
              endOfSchoolCurrentYear={endOfSchoolYear}
              startDate={queryStartDate}
              setStartDate={setQueryStartDate}
              setEndDate={setQueryEndDate}
              userCreatedDate={props.userCreatedDate}
            />
          </div>

          <div className={classes.item}>
            <ScheduleViewToggle
              view={props.view}
              listViewRoute={props.listViewRoute}
              calendarViewRoute={props.calendarViewRoute}
            />
          </div>
        </div>

        <Divider />

        <div className={classes.viewContainer}>
          {props.view === "calendar" && (
            <SubstituteAssignmentsCalendarView
              userId={props.userId}
              fromDate={beginningOfSchoolYear}
              toDate={queryEndDate}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
              orgId={props.orgId}
            />
          )}
          {props.view === "list" && (
            <SubstituteAssignmentsListView
              userId={props.userId}
              startDate={queryStartDate}
              endDate={queryEndDate}
              isAdmin={props.viewingAsAdmin}
              orgId={props.orgId}
            />
          )}
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  section: {
    padding: 0,
  },
  itemContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: `${theme.typography.pxToRem(14)} ${theme.typography.pxToRem(24)}`,
  },
  item: {
    display: "flex",
    alignItems: "center",
  },
  viewContainer: {
    padding: `0 ${theme.typography.pxToRem(24)} ${theme.typography.pxToRem(
      18
    )}`,
    [theme.breakpoints.down("sm")]: {
      padding: 0,
    },
  },
  sticky: {
    position: "sticky",
    top: 0,
    zIndex: 400,
    backgroundColor: theme.customColors.appBackgroundGray,
    boxShadow: `0 ${theme.typography.pxToRem(32)} ${theme.typography.pxToRem(
      16
    )} -${theme.typography.pxToRem(13)} ${
      theme.customColors.appBackgroundGray
    }`,
  },
  assignments: {
    padding: theme.spacing(1),
  },
}));
