import { Divider } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { addMonths } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { ScheduleHeader } from "ui/components/schedule/schedule-header";
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

  const numberOfMonthsInSchoolYear = 12;
  const today = new Date();

  const beginningOfSchoolYear = useMemo(() => {
    // Always show july to june
    const july = 6; /* months start at 0 in js dates */
    let year = today.getFullYear();
    if (today.getMonth() < july) {
      year -= 1;
    }
    return new Date(year, july);
  }, [today]);

  const endOfSchoolYear = useMemo(
    () => addMonths(beginningOfSchoolYear, numberOfMonthsInSchoolYear),
    [beginningOfSchoolYear]
  );

  const [queryStartDate, setQueryStartDate] = useState(today);

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
        <PageTitle title="My Schedule" />
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
              beginningOfSchoolYear={beginningOfSchoolYear}
              endOfSchoolYear={endOfSchoolYear}
              startDate={queryStartDate}
              setStartDate={setQueryStartDate}
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
              toDate={endOfSchoolYear}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
          )}
          {props.view === "list" && (
            <ListView
              userId={userId}
              startDate={queryStartDate}
              endDate={endOfSchoolYear}
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
