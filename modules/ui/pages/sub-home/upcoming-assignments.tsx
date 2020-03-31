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
} from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useQueryParamIso } from "hooks/query-params";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
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
import { SubScheduleRoute } from "ui/routes/sub-schedule";
import { Padding } from "ui/components/padding";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { SectionHeader } from "ui/components/section-header";
import { Link } from "react-router-dom";

type Props = {
  userId?: string;
};

export const UpcomingAssignments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const getUpcomingAssignments = useQueryBundle(GetUpcomingAssignments, {
    variables: {
      id: props.userId ?? "",
      fromDate,
      toDate,
      includeCompletedToday: false,
    },
    skip: !props.userId,
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
        userId: props.userId ?? "",
        toDate,
        fromDate,
      },
      skip: !props.userId,
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
    </>
  );
};

const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: 0,
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
