import { Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { addMonths } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { PageTitle } from "ui/components/page-title";
import { Section } from "ui/components/section";
import { QueryOrgUsers } from "ui/pages/sub-home/graphql/get-orgusers.gen";
import { useRouteParams } from "ui/routes/definition";
import {
  SubScheduleCalendarViewRoute,
  SubScheduleListViewRoute,
  SubScheduleRoute,
} from "ui/routes/sub-schedule";
import { GetUpcomingAssignments } from "../sub-home/graphql/get-upcoming-assignments.gen";
import { CalendarView } from "./calendar-view";
import { ScheduleViewToggle } from "./schedule-view-toggle";

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

  const beginningOfSchoolYear = useMemo(() => {
    const today = new Date();
    // Always show july to june
    const july = 6; /* months start at 0 in js dates */
    let year = today.getFullYear();
    if (today.getMonth() < july) {
      year -= 1;
    }
    return new Date(year, july);
  }, []);

  const endOfSchoolYear = useMemo(() => addMonths(beginningOfSchoolYear, 12), [
    beginningOfSchoolYear,
  ]);

  const schoolYear = useMemo(
    () =>
      `${beginningOfSchoolYear.getFullYear()}-${endOfSchoolYear.getFullYear()}`,
    [beginningOfSchoolYear, endOfSchoolYear]
  );

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(userId),
      fromDate: beginningOfSchoolYear,
      toDate: endOfSchoolYear,
      includeCompletedToday: false,
    },
    skip: !userId,
  });

  const data = useMemo(() => {
    if (
      upcomingAssignments.state == "DONE" ||
      upcomingAssignments.state == "UPDATING"
    ) {
      return compact(
        upcomingAssignments.data.employee?.employeeAssignmentSchedule
      );
    }
    return [];
  }, [upcomingAssignments]);

  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <>
      <PageTitle title="My Schedule" withoutHeading />

      <Grid className={classes.header}>
        <Typography variant="h5">{t("My Schedule")}</Typography>
        <Typography variant="h1">{schoolYear}</Typography>
      </Grid>

      <Section>
        <Grid container justify="space-between">
          <Grid item>
            {props.view === "calendar" && (
              <Typography variant="h5">{t("Upcoming 12 months")}</Typography>
            )}
          </Grid>

          <Grid item>
            <ScheduleViewToggle
              view={props.view}
              listViewRoute={SubScheduleListViewRoute.generate(params)}
              calendarViewRoute={SubScheduleCalendarViewRoute.generate(params)}
            />
          </Grid>
        </Grid>
        <Divider className={classes.divider} />

        {props.view === "calendar" && (
          <CalendarView
            userId={userId}
            assignments={data}
            fromDate={beginningOfSchoolYear}
            toDate={endOfSchoolYear}
          />
        )}
        {props.view === "list" && <div>LIST</div>}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  divider: {
    margin: `${theme.typography.pxToRem(8)} -${theme.typography.pxToRem(32)}`,
  },
  header: { paddingBottom: theme.spacing(3) },
}));
