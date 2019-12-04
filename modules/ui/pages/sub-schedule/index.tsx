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
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const upcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(userId),
      fromDate,
      toDate,
      includeCompletedToday: false,
    },
    skip: !userId,
  });

  if (upcomingAssignments.state !== "DONE") {
    return <></>;
  }

  const data = upcomingAssignments.data.employee?.employeeAssignmentSchedule;
  console.log(
    "userId",
    userId,
    "jobs",
    upcomingAssignments.data.employee?.employeeAssignmentSchedule
  );

  return (
    <>
      <PageTitle title="My Schedule" withoutHeading />

      <Typography variant="h5">{t("My Schedule")}</Typography>
      <Typography variant="h1">2019-2020</Typography>

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
        {/* <Divider /> */}
      </Section>
      <Section>
        ALL
        {/* {data?.map((a, i) => (
          <AssignmentRow
            key={a?.id || i}
            confirmationNumber={a?.assignment?.id.toString() || i.toString()}
            startTime={a?.startTimeLocal}
            endTime={a?.endTimeLocal}
            employeeName={`${a?.vacancy?.absence?.employee?.firstName} ${a?.vacancy?.absence?.employee?.lastName}`}
            dates={`${a?.startDate}` || "n/a"}
            locationName={a?.location?.name || "n/a"}
            positionName={a?.vacancy?.position?.name || "n/a"}
            totalDayPart={DayPart.FullDay}
            onCancel={() => console.log("cancel")}
          />
        ))} */}
        {/* Either list or calendar view */}
        {props.view === "calendar" && <CalendarView userId={userId} />}
        {props.view === "list" && <div>LIST</div>}
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
