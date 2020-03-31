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
import {
  addDays,
  format,
  isEqual,
  parseISO,
  isBefore,
  getDay,
  startOfDay,
} from "date-fns";
import {
  useMutationBundle,
  usePagedQueryBundle,
  useQueryBundle,
} from "graphql/hooks";
import { daysOfWeekOrdered } from "helpers/day-of-week";
import {
  OrgUser,
  VacancyDetail,
  PermissionEnum,
  UserAvailability,
  DayOfWeek,
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { Padding } from "ui/components/padding";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
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
import { ConfirmOverrideDialog } from "./components/confirm-override";
import { GetUnavilableTimeExceptions } from "ui/pages/sub-availability/graphql/get-unavailable-exceptions.gen";
import { GetMyAvailableTime } from "ui/pages/sub-availability/graphql/get-available-time.gen";

type Props = {
  viewingAsAdmin?: boolean;
  userId?: string;
};

export const SubHome: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
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
    skip: props.userId !== undefined,
  });

  const orgUsers = (getOrgUsers.state === "LOADING" ||
  getOrgUsers.state === "UPDATING"
    ? []
    : getOrgUsers.data?.userAccess?.me?.user?.orgUsers ?? []) as Pick<
    OrgUser,
    "id" | "orgId"
  >[];
  const userId = props.userId
    ? props.userId
    : getOrgUsers.state === "LOADING" || getOrgUsers.state === "UPDATING"
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
    skip: !userId || props.viewingAsAdmin,
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

  const [getExceptions, _] = usePagedQueryBundle(
    GetUnavilableTimeExceptions,
    r => r.user?.pagedUserUnavailableTime?.totalCount,
    {
      variables: {
        userId: userId,
        toDate,
        fromDate,
      },
      skip: !userId || props.viewingAsAdmin,
    }
  );
  const exceptions = useMemo(() => {
    if (
      getExceptions.state === "DONE" &&
      getExceptions.data.user?.pagedUserUnavailableTime?.results
    ) {
      return (
        compact(getExceptions.data.user?.pagedUserUnavailableTime?.results) ??
        []
      );
    }
    return [];
  }, [getExceptions]);

  const getAvailableTime = useQueryBundle(GetMyAvailableTime);

  const regularAvailableTime = useMemo(() => {
    if (getAvailableTime.state === "DONE") {
      return getAvailableTime.data.userAccess?.me?.user?.availableTime ?? [];
    }
    return [];
  }, [getAvailableTime]);

  const onDismissVacancy = async (vacancyId: string) => {
    const employeeId = determineEmployeeId(vacancyId);
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

  const determineEmployeeId = (vacancyId: string) => {
    const orgId =
      sortedVacancies.find(o => o.vacancy.id === vacancyId)?.vacancy.orgId ??
      "";
    const employeeId = orgUsers.find(o => o.orgId === orgId)?.id ?? 0;
    return employeeId;
  };

  const onCloseRequestAbsenceDialog = async () => {
    setRequestAbsenceIsOpen(false);
    await getVacancies.refetch();
    await getUpcomingAssignments.refetch();
  };

  const onAcceptVacancy = async (
    vacancyId: string,
    unavailableToWork?: boolean,
    overridePreferred?: boolean
  ) => {
    if (unavailableToWork && !overridePreferred) {
      setVacancyId(vacancyId);
      setOverrideDialogOpen(true);
    } else {
      setOverrideDialogOpen(false);
      const employeeId = determineEmployeeId(vacancyId);
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
    .map(a => startOfDay(parseISO(a.startDate)))
    .filter(
      (date, i, self) => self.findIndex(d => isEqual(d, startOfDay(date))) === i
    );
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
          [classes.lastAssignmentInList]:
            assignments.length > 1 && index == assignments.length - 1, // last one as long as there are more than 1
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

  const uniqueNonWorkingDays = useMemo(() => {
    const dates = [] as Date[];
    exceptions
      .filter(e => e.availabilityType === UserAvailability.NotAvailable)
      .forEach(e => {
        let startDate = parseISO(e.startDate);
        const endDate = parseISO(e.endDate);
        do {
          dates.push(startOfDay(startDate));
          startDate = addDays(startDate, 1);
        } while (startDate <= endDate);
      });

    return dates.map(date => ({
      date,
      buttonProps: { className: classes.unavailableDate },
    }));
  }, [classes.unavailableDate, exceptions]);

  const uniqueAvailableBeforeDays = useMemo(
    () =>
      exceptions
        .filter(e => e.availabilityType === UserAvailability.Before)
        .map(e => ({
          date: startOfDay(parseISO(e.startDate)),
          buttonProps: { className: classes.availableBeforeDate },
        })),
    [classes.availableBeforeDate, exceptions]
  );

  const uniqueAvailableAfterDays = useMemo(
    () =>
      exceptions
        .filter(e => e.availabilityType === UserAvailability.After)
        .map(e => ({
          date: startOfDay(parseISO(e.startDate)),
          buttonProps: { className: classes.availableAfterDate },
        })),
    [classes.availableAfterDate, exceptions]
  );

  const processRegularSchedule = () => {
    let startDate = fromDate;
    do {
      const dow = getDay(startDate);
      const dowAvailability = regularAvailableTime.find(
        x => x?.daysOfWeek[0] === daysOfWeekOrdered[dow]
      );
      switch (dowAvailability?.availabilityType) {
        case UserAvailability.NotAvailable:
          uniqueNonWorkingDays.push({
            date: startOfDay(startDate),
            buttonProps: { className: classes.unavailableDate },
          });
          break;
        case UserAvailability.Before:
          uniqueAvailableBeforeDays.push({
            date: startOfDay(startDate),
            buttonProps: { className: classes.availableBeforeDate },
          });
          break;
        case UserAvailability.After:
          uniqueAvailableAfterDays.push({
            date: startOfDay(startDate),
            buttonProps: { className: classes.availableAfterDate },
          });
          break;
        default:
          break;
      }
      startDate = addDays(startDate, 1);
    } while (startDate <= toDate);
    console.log(uniqueNonWorkingDays);
  };

  const activeDates = useMemo(
    () =>
      uniqueWorkingDays.map(date => ({
        date: startOfDay(date),
        buttonProps: { className: classes.activeDate },
      })),
    [classes.activeDate, uniqueWorkingDays]
  );

  processRegularSchedule();
  const disabledDates = uniqueNonWorkingDays
    .concat(uniqueAvailableBeforeDays)
    .concat(uniqueAvailableAfterDays)
    .filter(
      d => !uniqueWorkingDays.find(uwd => uwd.getTime() == d.date.getTime())
    );

  const calendarDates = disabledDates.concat(activeDates);

  return (
    <>
      {!props.viewingAsAdmin && (
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
                  to={SubScheduleRoute.generate({})}
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
                    customDates={calendarDates}
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
      )}
      <Can do={[PermissionEnum.AbsVacAssign]}>
        <Section className={classes.wrapper}>
          <Grid container spacing={2} className={classes.header}>
            <Typography variant="h5" className={classes.availableJobsTitle}>
              {t("Available assignments")}
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
                {t("Loading available assignments")}
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
                  viewingAsAdmin={props.viewingAsAdmin}
                />
              ))
            ) : (
              <Typography variant="h5">
                {t("No assignments available")}
              </Typography>
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

      <ConfirmOverrideDialog
        open={overrideDialogOpen}
        vacancyId={vacancyId}
        setOverrideDialogOpen={setOverrideDialogOpen}
        onAccept={onAcceptVacancy}
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
    top: theme.typography.pxToRem(-35),
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
  unavailableDate: {
    backgroundColor: theme.customColors.medLightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
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
  availableBeforeDate: {
    background: `linear-gradient(to left top, ${theme.customColors.medLightGray}, ${theme.customColors.white} 65%)`,
  },
  availableAfterDate: {
    background: `linear-gradient(to right bottom, ${theme.customColors.medLightGray}, ${theme.customColors.white} 65%)`,
  },
}));
