import { Grid, Button, Typography } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { AssignmentCard } from "ui/pages/sub-home/components/assignment";
import { useQueryBundle } from "graphql/hooks";
import { useRouteParams } from "ui/routes/definition";
import { VacancyDetail } from "graphql/server-types.gen";
import { GetUpcomingAssignments } from "ui/pages/sub-home/graphql/get-upcoming-assignments.gen";
import { addDays, format, isEqual, parseISO } from "date-fns";
import { SubScheduleRoute } from "ui/routes/sub-schedule";
import { SubHomeRoute } from "ui/routes/sub-home";
import { FiveWeekCalendar } from "ui/components/form/five-week-calendar";

type Props = {
  userId: string | null | undefined;
  itemsToShow?: number;
};

export const ScheduleUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const params = useRouteParams(SubHomeRoute);
  const isMobile = useScreenSize() === "mobile";

  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const getUpcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(props.userId),
      fromDate,
      toDate,
      includeCompletedToday: false,
    },
    skip: !props.userId,
  });

  const assignments = (getUpcomingAssignments.state === "LOADING" ||
  getUpcomingAssignments.state === "UPDATING"
    ? []
    : getUpcomingAssignments.data?.employee?.employeeAssignmentSchedule ??
      []) as Pick<
    VacancyDetail,
    | "id"
    | "startTimeLocal"
    | "endTimeLocal"
    | "assignment"
    | "location"
    | "vacancy"
    | "startDate"
    | "endDate"
  >[];

  const uniqueWorkingDays = assignments
    .map(a => parseISO(a.startDate))
    .filter((date, i, self) => self.findIndex(d => isEqual(d, date)) === i);
  const upcomingWorkTitle = isMobile
    ? t("Upcoming work")
    : `${t("Upcoming assignments for")} ${format(fromDate, "MMM d")} - ${format(
        toDate,
        "MMM d"
      )}`;

  const assignmentsToShow = props.itemsToShow
    ? assignments.slice(0, 3)
    : assignments;

  return (
    <>
      <Grid
        container
        className={classes.upcomingWork}
        spacing={2}
        alignItems="stretch"
      >
        <SectionHeader title={upcomingWorkTitle} />
        <Grid item xs={12} sm={6} lg={6}>
          {getUpcomingAssignments.state === "LOADING" ? (
            <Section>
              <Typography variant="h5">
                {t("Loading Upcoming Assignments")}
              </Typography>
            </Section>
          ) : assignments.length === 0 ? (
            <Section>
              <Grid item>
                <Typography variant="h5">
                  {t("No Assignments scheduled")}
                </Typography>
              </Grid>
            </Section>
          ) : (
            assignmentsToShow.map((assignment, index) => (
              <AssignmentCard
                vacancyDetail={assignment}
                shadeRow={false}
                key={index}
              />
            ))
          )}
          {props.itemsToShow && (
            <Button component={Link} to={SubScheduleRoute.generate(params)}>
              {t("View All")}
            </Button>
          )}
        </Grid>
        {!isMobile && (
          <Grid item xs={12} sm={6} lg={6}>
            <Section>
              <FiveWeekCalendar
                startDate={fromDate}
                disableWeekends={true}
                selectedDates={uniqueWorkingDays}
              />
            </Section>
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  filters: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  header: {
    marginBottom: theme.spacing(2),
  },
  upcomingWork: {
    backgroundColor: "transparent",
  },
}));
