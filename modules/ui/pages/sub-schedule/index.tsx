import { Divider, Grid, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
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
import { CalendarView } from "./calendar-view";
import { ScheduleViewToggle } from "./schedule-view-toggle";
import { GetUpcomingAssignments } from "../sub-home/graphql/get-upcoming-assignments.gen";
import { addDays } from "date-fns";
import { useMemo } from "react";
import { AssignmentRow } from "./assignment-row";
import { DayPart } from "graphql/server-types.gen";

import { addMonths, parseISO } from "date-fns";
import { groupBy, compact } from "lodash-es";
import { startOfMonth } from "date-fns/esm";

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

  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addMonths(fromDate, 12), [fromDate]);

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(userId),
      fromDate,
      toDate,
      includeCompletedToday: false,
    },
    skip: !userId,
  });

  if (
    upcomingAssignments.state !== "DONE" &&
    upcomingAssignments.state !== "UPDATING"
  ) {
    return <></>;
  }

  const data = compact(
    upcomingAssignments.data.employee?.employeeAssignmentSchedule
  );

  return (
    <>
      <PageTitle title="My Schedule" withoutHeading />

      <Grid className={classes.header}>
        <Typography variant="h5">{t("My Schedule")}</Typography>
        <Typography variant="h1">2019-2020</Typography>
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
          <CalendarView userId={userId} assignments={data} />
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
