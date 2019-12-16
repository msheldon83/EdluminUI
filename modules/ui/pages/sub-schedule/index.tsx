import { Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { addMonths, endOfMonth } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo, useState } from "react";
import { getBeginningOfSchoolYear } from "ui/components/helpers";
import { PageTitle } from "ui/components/page-title";
import { numberOfMonthsInSchoolYear } from "ui/components/schedule/helpers";
import { ScheduleViewToggle } from "ui/components/schedule/schedule-view-toggle";
import { Section } from "ui/components/section";
import { QueryOrgUsers } from "ui/pages/sub-home/graphql/get-orgusers.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  SubScheduleCalendarViewRoute,
  SubScheduleListViewRoute,
  SubScheduleRoute,
} from "ui/routes/sub-schedule";
import { CalendarView } from "./calendar-view";
import { NowViewingAssignmentsForDate } from "./calendar-view/now-viewing-assignments";
import { ListView } from "./list-view";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
import { useTranslation } from "react-i18next";

type Props = {
  view: "list" | "calendar";
};

export const SubSchedule: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubScheduleRoute);
  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });
  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const onSelectDate = React.useCallback(
    (date: Date) => setSelectedDate(date),
    [setSelectedDate]
  );
  return (
    <div className={classes.pageContainer}>
      <div className={props.view === "calendar" ? classes.sticky : ""}>
        <PageTitle title={t("My Schedule")} />
        {props.view === "calendar" && (
          <Section className={classes.assignments}>
            <NowViewingAssignmentsForDate date={selectedDate} userId={userId} />
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
              userId={userId}
            />
          </div>

          <div className={classes.item}>
            <ScheduleViewToggle
              view={props.view}
              listViewRoute={SubScheduleListViewRoute.generate(params)}
              calendarViewRoute={SubScheduleCalendarViewRoute.generate(params)}
            />
          </div>
        </div>

        <Divider />

        <div className={classes.viewContainer}>
          {props.view === "calendar" && (
            <CalendarView
              userId={userId}
              fromDate={beginningOfSchoolYear}
              toDate={queryEndDate}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
          )}
          {props.view === "list" && (
            <ListView
              userId={userId}
              startDate={queryStartDate}
              endDate={queryEndDate}
            />
          )}
        </div>
      </Section>
    </div>
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
