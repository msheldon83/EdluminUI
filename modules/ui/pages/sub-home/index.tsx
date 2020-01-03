import {
  Button,
  Divider,
  Grid,
  IconButton,
  Link as MuiLink,
  Typography,
} from "@material-ui/core";
import { FilterList } from "@material-ui/icons";
import RefreshIcon from "@material-ui/icons/Refresh";
import { makeStyles } from "@material-ui/styles";
import clsx from "clsx";
import { addDays, format, isEqual, parseISO } from "date-fns";
import {
  useMutationBundle,
  usePagedQueryBundle,
  useQueryBundle,
} from "graphql/hooks";
import { OrgUser, Vacancy, VacancyDetail } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { FiveWeekCalendar } from "ui/components/form/five-week-calendar";
import { Padding } from "ui/components/padding";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useRouteParams } from "ui/routes/definition";
import { SubHomeRoute } from "ui/routes/sub-home";
import { SubScheduleRoute } from "ui/routes/sub-schedule";
import { AssignmentCard } from "./components/assignment";
import { AvailableJob } from "./components/available-job";
import { RequestAbsenceDialog } from "./components/request-dialog";
import { FilterQueryParams } from "./filters/filter-params";
import { Filters } from "./filters/index";
import { DismissVacancy } from "./graphql/dismiss-vacancy.gen";
import { QueryOrgUsers } from "./graphql/get-orgusers.gen";
import { GetUpcomingAssignments } from "./graphql/get-upcoming-assignments.gen";
import { RequestVacancy } from "./graphql/request-vacancy.gen";
import { SubJobSearch } from "./graphql/sub-job-search.gen";

type Props = {};

export const SubHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubHomeRoute);
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const [showFilters, setShowFilters] = React.useState(!isMobile);
  const [requestAbsenceIsOpen, setRequestAbsenceIsOpen] = React.useState(false);
  const [employeeId, setEmployeeId] = React.useState<string | null>(null);
  const [vacancyId, setVacancyId] = React.useState<string | null>(null);
  const [dismissedAssignments, setDismissedAssignments] = React.useState<
    string[]
  >([]);
  const [dismissVacancyMutation] = useMutationBundle(DismissVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [requestVacancyMutation] = useMutationBundle(RequestVacancy, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const [filters] = useQueryParamIso(FilterQueryParams);

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
  const userId =
    getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
      ? undefined
      : getOrgUsers.data?.userAccess?.me?.user?.id;

  const [getVacancies, pagination] = usePagedQueryBundle(
    SubJobSearch,
    r => r.vacancy?.userJobSearch?.totalCount,
    {
      variables: {
        ...filters,
        id: String(userId),
      },
      skip: !userId,
    }
  );

  const vacancies = useMemo(
    () =>
      (getVacancies.state === "DONE" || getVacancies.state === "UPDATING"
        ? getVacancies.data.vacancy?.userJobSearch?.results ?? []
        : []) as Pick<
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
      >[],
    [getVacancies]
  );

  const sortedVacancies = useMemo(
    () =>
      vacancies
        .filter(x => !dismissedAssignments.includes(x.id))
        .sort(x => x.startTimeLocal),
    [vacancies, dismissedAssignments]
  );
  const onRefreshVacancies = async () => await getVacancies.refetch();

  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const getUpcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: String(userId),
      fromDate,
      toDate,
      includeCompletedToday: false,
    },
    skip: !userId,
  });

  const assignments = useMemo(
    () =>
      (getUpcomingAssignments.state === "LOADING"
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
      >[],
    [getUpcomingAssignments]
  );

  const onDismissVacancy = async (orgId: string, vacancyId: string) => {
    const employeeId = determineEmployeeId(orgId);
    if (employeeId != 0) {
      setDismissedAssignments([...dismissedAssignments, vacancyId]);
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

  const onCloseRequestAbsenceDialog = async () => {
    setRequestAbsenceIsOpen(false);
    await getVacancies.refetch();
    await getUpcomingAssignments.refetch();
  };

  const onAcceptVacancy = async (orgId: string, vacancyId: string) => {
    const employeeId = determineEmployeeId(orgId);
    if (employeeId != 0) {
      await requestVacancyMutation({
        variables: {
          vacancyRequest: {
            vacancyId: vacancyId,
            employeeId: Number(employeeId),
          },
        },
      });
    }
    setEmployeeId(employeeId.toString());
    setVacancyId(vacancyId);
    setRequestAbsenceIsOpen(true);
  };

  const uniqueWorkingDays = assignments
    .map(a => parseISO(a.startDate))
    .filter((date, i, self) => self.findIndex(d => isEqual(d, date)) === i);
  const upcomingWorkTitle = isMobile
    ? t("Upcoming work")
    : `${t("Upcoming assignments for")} ${format(fromDate, "MMM d")} - ${format(
        toDate,
        "MMM d"
      )}`;

  const renderAssignments = () => {
    const numberOfAssignments = isMobile ? 2 : 3;

    return assignments
      .slice(0, numberOfAssignments)
      .map((assignment, index, assignments) => {
        const classNames = clsx({
          [classes.lastAssignmentInList]: index == assignments.length - 1, // last one
        });

        return (
          <AssignmentCard
            vacancyDetail={assignment}
            shadeRow={false}
            key={index}
            className={classNames}
          />
        );
      });
  };

  return (
    <>
      <Grid
        container
        className={classes.upcomingWork}
        spacing={2}
        alignItems="stretch"
      >
        <Grid item xs={12} style={{ paddingBottom: 0 }}>
          <SectionHeader
            title={upcomingWorkTitle}
            titleClassName={classes.title}
          />
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
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
            renderAssignments()
          )}
          <MuiLink
            className={classes.viewAllAssignmentsLink}
            component={Link}
            to={SubScheduleRoute.generate(params)}
          >
            {t("View All")}
          </MuiLink>
        </Grid>
        {!isMobile && (
          <Grid item xs={12} sm={6} lg={6}>
            <Section>
              <Padding bottom={6}>
                <FiveWeekCalendar
                  startDate={fromDate}
                  disableWeekends={true}
                  selectedDates={uniqueWorkingDays}
                  contained={false}
                />
              </Padding>
            </Section>
          </Grid>
        )}
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Section>
            <Grid
              container
              className={classes.header}
              justify="space-between"
              alignItems="center"
              spacing={2}
            >
              <Grid item>
                <Typography variant="h5">
                  {t("Available Assignments")}
                </Typography>
              </Grid>

              {isMobile ? (
                <Grid item>
                  <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    {t("Filters")}
                  </Button>
                  <IconButton onClick={onRefreshVacancies}>
                    <RefreshIcon />
                  </IconButton>
                </Grid>
              ) : (
                <Grid item>
                  <Button variant="outlined" onClick={onRefreshVacancies}>
                    {t("Refresh")}
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
                sortedVacancies.map((vacancy, index) => (
                  <AvailableJob
                    vacancy={vacancy}
                    shadeRow={index % 2 != 0}
                    onDismiss={onDismissVacancy}
                    key={index}
                    onAccept={onAcceptVacancy}
                  />
                ))
              )}
            </div>
          </Section>
        </Grid>
      </Grid>

      <RequestAbsenceDialog
        open={requestAbsenceIsOpen}
        onClose={onCloseRequestAbsenceDialog}
        employeeId={employeeId}
        vacancyId={vacancyId}
      />
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
  title: {
    marginBottom: 0,
  },
  upcomingWork: {
    backgroundColor: "transparent",

    [theme.breakpoints.down("md")]: {
      padding: theme.spacing(2),
      paddingTop: 0,
    },
  },
  lastAssignmentInList: {
    opacity: 0.4,
    position: "relative",

    "&:after": {
      content: "''",
      position: "absolute",
      top: 0,
      left: `-${theme.typography.pxToRem(20)}`,
      width: `calc(100% + ${theme.typography.pxToRem(40)})`,
      height: `calc(100% + ${theme.typography.pxToRem(20)})`,
      background:
        "linear-gradient(0deg, rgba(242,242,242,1) 33%, rgba(242,242,242,0) 80%)",
    },
  },
  viewAllAssignmentsLink: {
    textDecoration: "underline",
    position: "relative",
    top: theme.typography.pxToRem(-40),
    left: theme.spacing(3),
  },
}));
