import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { makeStyles } from "@material-ui/styles";
import { Divider } from "@material-ui/core";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { Section } from "ui/components/section";
import { SubstituteAssignmentsCalendarView } from "./substitute-assignments-calendar";
import { NowViewingAssignmentsForDate } from "./substitute-assignments-calendar/now-viewing-assignments";
import { SubstituteAssignmentsListView } from "./substitute-assignments-list";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { useTranslation } from "react-i18next";
import { useIsAdmin } from "reference-data/is-admin";
import { useMemo, useState } from "react";
import { getBeginningOfSchoolYear } from "ui/components/helpers";
import { numberOfMonthsInSchoolYear } from "ui/components/schedule/helpers";
import { addMonths, endOfMonth } from "date-fns";

type Props = {
  view: "list" | "calendar";
  pageTitle: string;
  userId: string;
  listViewRoute: string;
  calendarViewRoute: string;
  orgId?: string;
};

export const SubstituteAssignments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  let userIsAdmin = useIsAdmin(); //Just in case an admin accesses this page
  userIsAdmin = userIsAdmin === null ? false : userIsAdmin;

  /* the value for today will not change as long as the 
      component is mounted. This could cause stale today
      values to be shown if the browser is on the same page
      over multiple days. */
  const today = useMemo(() => new Date(), []);

  const beginningOfSchoolYear = useMemo(() => {
    return getBeginningOfSchoolYear(today);
  }, [today]);

  const endOfSchoolYear = useMemo(
    () =>
      endOfMonth(
        addMonths(beginningOfSchoolYear, numberOfMonthsInSchoolYear - 1)
      ),
    [beginningOfSchoolYear]
  );

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

  return (
    <>
      <div className={props.view === "calendar" ? classes.sticky : ""}>
        <PageTitle title={t(props.pageTitle)} />
        {props.view === "calendar" && (
          <Section className={classes.assignments}>
            <NowViewingAssignmentsForDate
              date={selectedDate}
              userId={props.userId}
              isAdmin={userIsAdmin}
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
              userId={props.userId}
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
              isAdmin={userIsAdmin}
              orgId={props.orgId}
            />
          )}
        </div>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  section: { padding: 0 },
  header: { paddingBottom: theme.spacing(3) },
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
    zIndex: 1,
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
