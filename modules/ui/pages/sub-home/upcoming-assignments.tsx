import * as React from "react";
import {
  Grid,
  Link as MuiLink,
  Typography,
  makeStyles,
} from "@material-ui/core";
import clsx from "clsx";
import {
  addDays,
  format,
  isEqual,
  isToday,
  parseISO,
  getDay,
  startOfDay,
  startOfWeek,
  eachDayOfInterval,
} from "date-fns";
import { usePagedQueryBundle, useQueryBundle } from "graphql/hooks";
import { daysOfWeekOrdered } from "helpers/day-of-week";
import { UserAvailability } from "graphql/server-types.gen";
import { useIsMobile } from "hooks";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { AssignmentCard } from "./components/assignment";
import { compact } from "lodash-es";
import { GetUnavilableTimeExceptions } from "ui/pages/sub-availability/graphql/get-unavailable-exceptions.gen";
import { GetMyAvailableTime } from "ui/pages/sub-availability/graphql/get-available-time.gen";
import { SubScheduleRoute } from "ui/routes/sub-schedule";
import { Padding } from "ui/components/padding";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { SectionHeader } from "ui/components/section-header";
import { Link } from "react-router-dom";
import { VacancyDetail } from "./components/assignment";
import { SubAvailabilityRoute } from "ui/routes/sub-schedule";

type Props = {
  userId?: string;
  assignments: VacancyDetail[];
  actingAsSubstitute?: boolean;
};

export const UpcomingAssignments: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useIsMobile();
  const history = useHistory();

  const fromDate = useMemo(() => new Date(), []);
  const toDate = useMemo(() => addDays(fromDate, 30), [fromDate]);

  const assignments = props.assignments;

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
            actingAsSubstitute={props.actingAsSubstitute}
          />
        );
      });
  };

  const pastDays = useMemo(
    () =>
      eachDayOfInterval({
        start: startOfWeek(fromDate),
        end: fromDate,
      }).map(date => ({ date, buttonProps: { className: classes.pastDate } })),
    [fromDate, classes.pastDate]
  );

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

  const calendarDates = disabledDates.concat(pastDays).concat(activeDates);
  const todayIndex = calendarDates.findIndex(o => isToday(o.date));
  if (todayIndex === -1) {
    calendarDates.push({
      date: new Date(),
      buttonProps: { className: classes.today },
    });
  } else {
    const today = calendarDates[todayIndex];
    calendarDates[todayIndex] = {
      date: today.date,
      buttonProps: {
        className: `${classes.today} ${today.buttonProps.className}`,
      },
    };
  }

  const preloadDate = (dates: Date[]) => {
    const baseRoute = SubAvailabilityRoute.generate({});
    const params = new URLSearchParams();
    params.set("fromDate", dates[0].toISOString());
    params.set("toDate", dates[dates.length - 1].toISOString());
    history.push(`${baseRoute}?${params.toString()}`);
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
          {assignments.length === 0 ? (
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
                  onSelectDates={preloadDate}
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
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.palette.primary.main,
      color: theme.customColors.white,
    },
  },
  unavailableDate: {
    backgroundColor: theme.customColors.medLightGray,
    color: theme.palette.text.disabled,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  weekendDate: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  pastDate: {
    pointerEvents: "none",
  },
  availableBeforeDate: {
    background: `linear-gradient(to left top, ${theme.customColors.medLightGray}, ${theme.customColors.white} 65%)`,
  },
  availableAfterDate: {
    background: `linear-gradient(to right bottom, ${theme.customColors.medLightGray}, ${theme.customColors.white} 65%)`,
  },
  today: {
    border: "solid black 1px",
    fontWeight: "bold",
  },
}));
