import { Grid, Button, Typography, Divider } from "@material-ui/core";
import { makeStyles, useTheme } from "@material-ui/styles";
import { useScreenSize } from "hooks";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { Filters } from "./filters/index";
import { AvailableJob } from "./components/available-job";
import { AssignmentCard } from "./components/assignment";
import { FilterList } from "@material-ui/icons";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { GetAllVacancies } from "./graphql/get-all-vacancies.gen";
import { DismissVacancy } from "./graphql/dismiss-vacancy.gen";
import { Vacancy, OrgUser, VacancyDetail } from "graphql/server-types.gen";
import { QueryOrgUsers } from "./graphql/get-orgusers.gen";
import { GetUpcomingAssignments } from "./graphql/get-upcoming-assignments.gen";
import { addDays } from "date-fns";

type Props = {};

export const SubHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const theme = useTheme();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const [showFilters, setShowFilters] = React.useState(!isMobile);
  const [dismissVacancyMutation] = useMutationBundle(DismissVacancy);

  const getOrgUsers = useQueryBundle(QueryOrgUsers, {
    fetchPolicy: "cache-first",
  });

  const orgUsers = (getOrgUsers.state === "LOADING" ||
  getOrgUsers.state === "UPDATING"
    ? []
    : getOrgUsers.data?.userAccess?.me?.user?.orgUsers ?? []) as Pick<
    OrgUser,
    "id" | "orgId"
  >[];
  const userId = (getOrgUsers.state === "LOADING" ||
  getOrgUsers.state === "UPDATING" ? undefined : getOrgUsers.data?.userAccess?.me?.user?.id)

  const fromDate = useMemo(() => new Date(), [orgUsers]);
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const getUpcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(userId),
      fromDate,
      toDate,
      limit: 3,
      includeCompletedToday: false,
    },
    skip: !userId,
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
  >[];

  const getVacancies = useQueryBundle(GetAllVacancies, {
    variables: {},
  });

  const vacancies = (getVacancies.state === "LOADING" ||
  getVacancies.state === "UPDATING"
    ? []
    : getVacancies.data?.vacancy?.all ?? []) as Pick<
    Vacancy,
    | "id"
    | "organization"
    | "position"
    | "absence"
    | "startTimeLocal"
    | "endTimeLocal"
    | "startDate"
    | "endDate"
    | "notesToReplacement"
    | "totalDayPortion"
    | "details"
  >[];

  const onDismissVacancy = async (orgId: string, vacancyId: string) => {
    const employeeId = determineEmployeeId(orgId);
    if (employeeId != 0) {
      await Promise.resolve(
        dismissVacancyMutation({
          variables: {
            vacancyRejection: {
              vacancyId: vacancyId,
              employeeId: Number(employeeId),
            },
          },
        })
      );
    }
    await getVacancies.refetch();
  };

  const determineEmployeeId = (orgId: string) => {
    const employeeId = orgUsers.find(o => o.orgId === Number(orgId))?.id ?? 0;
    return employeeId;
  };

  return (
    <>
      <Section>
        <SectionHeader title={t("Upcoming work")} />
        <Grid container>
          <Grid item xs={12} sm={6} lg={6}>
            {getUpcomingAssignments.state === "LOADING" ? (
              <Grid item>
                <Typography variant="h5">
                  {t("Loading Upcoming Assignments")}
                </Typography>
              </Grid>
            ) : assignments.length === 0 ? (
              <Grid item>
                <Typography variant="h5">
                  {t("No Assignments schedule")}
                </Typography>
              </Grid>
            ) : (
              assignments.map((assignment, index) => (
                <AssignmentCard
                  vacancyDetail={assignment}
                  shadeRow={false}
                  key={index}
                />
              ))
            )}
          </Grid>
          <Grid item xs={12} sm={6} lg={6}>
            {"Calendar goes here"}
          </Grid>
        </Grid>
      </Section>
      <Section>
        <Grid
          container
          className={classes.header}
          justify="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h5">{t("Available Jobs")}</Typography>
          </Grid>
          {isMobile && (
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                {t("Filters")}
              </Button>
            </Grid>
          )}
        </Grid>
        {showFilters && <Filters />}
        <div>
          <Divider className={classes.header} />
          {getVacancies.state === "LOADING" ? (
            <Grid item>
              <Typography variant="h5">
                {t("Loading Available Jobs")}
              </Typography>
            </Grid>
          ) : vacancies.length === 0 ? (
            <Grid item>
              <Typography variant="h5">{t("No Jobs Available")}</Typography>
            </Grid>
          ) : (
            vacancies.map((vacancy, index) => (
              <AvailableJob
                vacancy={vacancy}
                shadeRow={index % 2 != 0}
                onDismiss={onDismissVacancy}
                key={index}
              />
            ))
          )}
        </div>
      </Section>
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
}));
