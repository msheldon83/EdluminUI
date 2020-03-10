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
import { addDays, format, isEqual, parseISO, isBefore } from "date-fns";
import {
  useMutationBundle,
  usePagedQueryBundle,
  useQueryBundle,
} from "graphql/hooks";
import {
  OrgUser,
  Vacancy,
  VacancyDetail,
  PermissionEnum,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CustomCalendar } from "ui/components/form/custom-calendar";
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
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { GetUpcomingAssignments } from "./graphql/get-upcoming-assignments.gen";
import { RequestVacancy } from "./graphql/request-vacancy.gen";
import { SubJobSearch } from "./graphql/sub-job-search.gen";
import { Can } from "ui/components/auth/can";
import { compact } from "lodash-es";

type Props = {};

export const SubHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(SubHomeRoute);
  const isMobile = useIsMobile();
  const { openSnackbar } = useSnackbar();
  const [showFilters, setShowFilters] = React.useState(!isMobile);
  React.useEffect(() => setShowFilters(!isMobile), [isMobile]);

  const [requestAbsenceIsOpen, setRequestAbsenceIsOpen] = React.useState(false);
  const [overrideDialogOpen, setOverrideDialogOpen] = React.useState(false);
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

  const getOrgUsers = useQueryBundle(GetMyUserAccess, {
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
    r => r.vacancy?.subJobSearch?.totalCount,
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
      getVacancies.state === "DONE" || getVacancies.state === "UPDATING"
        ? compact(getVacancies.data.vacancy?.subJobSearch?.results) ?? []
        : [],
    [getVacancies]
  );

  const sortedVacancies = useMemo(
    () =>
      vacancies
        .filter(x => !dismissedAssignments.includes(x?.vacancy.id ?? ""))
        .sort((a, b) =>
          isBefore(
            parseISO(a?.vacancy.startTimeLocal),
            parseISO(b?.vacancy.startTimeLocal)
          )
            ? -1
            : 1
        ),
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
              employeeId: employeeId,
            },
          },
        })
      );
    }
    await getVacancies.refetch();
  };

  const determineEmployeeId = (orgId: string) => {
    const employeeId = orgUsers.find(o => o.orgId === orgId)?.id ?? 0;
    return employeeId;
  };

  const onCloseRequestAbsenceDialog = async () => {
    setRequestAbsenceIsOpen(false);
    await getVacancies.refetch();
    await getUpcomingAssignments.refetch();
  };

  const onAcceptVacancy = async (
    orgId: string,
    vacancyId: string,
    unavailableToWork?: boolean,
    overridePreferred?: boolean
  ) => {
    if (unavailableToWork && !overridePreferred) {
      setOverrideDialogOpen(true);
    } else {
      const employeeId = determineEmployeeId(orgId);
      if (employeeId != 0) {
        await requestVacancyMutation({
          variables: {
            vacancyRequest: {
              vacancyId: vacancyId,
              employeeId: employeeId,
            },
          },
        });
      }
      setEmployeeId(employeeId.toString());
      setVacancyId(vacancyId);
      setRequestAbsenceIsOpen(true);
    }
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

  const activeDates = uniqueWorkingDays.map(date => ({
    date,
    buttonProps: { className: classes.activeDate },
  }));

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
              <Typography variant="h5">
                {t("No Assignments scheduled")}
              </Typography>
            </Section>
          ) : (
            <>
              {renderAssignments()}
              <MuiLink
                className={classes.viewAllAssignmentsLink}
                component={Link}
                to={SubScheduleRoute.generate(params)}
              >
                {t("View All")}
              </MuiLink>
            </>
          )}
        </Grid>
        {!isMobile && (
          <Grid item xs={12} sm={6} lg={6}>
            <Section>
              <Padding bottom={6}>
                <CustomCalendar
                  customDates={activeDates}
                  month={fromDate}
                  contained={false}
                  classes={{
                    weekend: classes.weekendDate,
                  }}
                />
              </Padding>
            </Section>
          </Grid>
        )}
      </Grid>
      <Can do={[PermissionEnum.AbsVacAssign]}>
        <Section className={classes.wrapper}>
          <Grid container spacing={2} className={classes.header}>
            <Typography variant="h5" className={classes.availableJobsTitle}>
              {t("Available Jobs")}
            </Typography>

            {isMobile ? (
              <div className={classes.jobButtons}>
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
              </div>
            ) : (
              <div className={classes.jobButtons}>
                <Button variant="outlined" onClick={onRefreshVacancies}>
                  {t("Refresh")}
                </Button>
              </div>
            )}
          </Grid>

          {showFilters && <Filters />}
          <div>
            <Divider className={classes.header} />
            {getVacancies.state === "LOADING" ? (
              <Typography variant="h5">
                {t("Loading Available Jobs")}
              </Typography>
            ) : vacancies.length > 0 ? (
              sortedVacancies.map((x, index) => (
                <AvailableJob
                  vacancy={x?.vacancy}
                  unavailableToWork={x?.unavailableToWork ?? false}
                  shadeRow={index % 2 != 0}
                  onDismiss={onDismissVacancy}
                  key={index}
                  onAccept={onAcceptVacancy}
                  overrideDialogOpen={overrideDialogOpen}
                  setOverrideDialogOpen={setOverrideDialogOpen}
                />
              ))
            ) : (
              <Typography variant="h5">{t("No Jobs Available")}</Typography>
            )}
          </div>
        </Section>
      </Can>

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
    position: "relative",
  },
  availableJobsTitle: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
  wrapper: {
    position: "relative",

    [theme.breakpoints.down("sm")]: {
      padding: theme.spacing(0),
      paddingTop: theme.spacing(2),
    },
  },
  jobButtons: {
    position: "absolute",
    top: "0",
    right: "12px",
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
  activeDate: {
    backgroundColor: theme.palette.primary.main,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
  weekendDate: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
}));
