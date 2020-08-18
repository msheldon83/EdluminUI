import { Grid } from "@material-ui/core";
import { useQueryBundle, usePagedQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { GetAssignmentDatesForSubstitute } from "../graphql/get-assignments-dates-for-substitute.gen";
import { AssignmentCalendar } from "./assignment-calendar";
import { generateMonths, mergeDatesByMonth } from "../grouping-helpers";
import { GetUnavilableTimeExceptions } from "ui/pages/sub-availability/graphql/get-unavailable-exceptions.gen";
import { GetMyAvailableTime } from "ui/pages/sub-availability/graphql/get-available-time.gen";
import { UserAvailability, DayOfWeek } from "graphql/server-types.gen";
import { daysOfWeekOrdered } from "helpers/day-of-week";
import { flatMap, groupBy } from "lodash-es";
import { CalendarLegend } from "ui/pages/sub-home/components/calendar-legend";
import { eachDayOfInterval, parseISO, addDays, getDay } from "date-fns";

type Props = {
  userId?: string;
  orgId?: string;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  fromDate: Date;
  toDate: Date;
};

export const SubstituteAssignmentsCalendarView: React.FC<Props> = props => {
  const { fromDate, toDate } = props;

  const [getExceptions, _] = usePagedQueryBundle(
    GetUnavilableTimeExceptions,
    r => r.user?.pagedUserUnavailableTime?.totalCount,
    {
      variables: {
        userId: props.userId ?? "",
        fromDate,
        toDate,
      },
      skip: !props.userId,
    }
  );
  const {
    notAvailableExceptions,
    beforeExceptions,
    afterExceptions,
  } = useMemo(() => {
    const exceptions =
      getExceptions.state === "DONE" &&
      getExceptions.data.user?.pagedUserUnavailableTime?.results
        ? compact(getExceptions.data.user?.pagedUserUnavailableTime?.results)
        : [];
    const groupedExceptions = groupBy(exceptions, e => e.availabilityType);
    return {
      notAvailableExceptions:
        groupedExceptions[UserAvailability.NotAvailable] ?? [],
      beforeExceptions: groupedExceptions[UserAvailability.Before] ?? [],
      afterExceptions: groupedExceptions[UserAvailability.After] ?? [],
    };
  }, [getExceptions]);

  const getAvailableTime = useQueryBundle(GetMyAvailableTime);

  const regularAvailableTime = useMemo(
    () =>
      getAvailableTime.state === "DONE"
        ? compact(getAvailableTime.data.userAccess?.me?.user?.availableTime) ??
          []
        : [],
    [getAvailableTime]
  );

  const upcomingAssignmentDates = useQueryBundle(
    GetAssignmentDatesForSubstitute,
    {
      variables: {
        id: String(props.userId),
        organizationId: props.orgId ?? null,
        fromDate,
        toDate,
        includeCompletedToday: true,
      },
      skip: !props.userId,
    }
  );

  const assignmentDates = useMemo(() => {
    if (
      upcomingAssignmentDates.state == "DONE" ||
      upcomingAssignmentDates.state == "UPDATING"
    ) {
      return compact(
        upcomingAssignmentDates.data.employee?.employeeAssignmentSchedule
      );
    }
    return [];
  }, [upcomingAssignmentDates]);

  const monthList = useMemo(() => generateMonths(fromDate, toDate), [
    fromDate,
    toDate,
  ]);

  const all = useMemo(
    () =>
      mergeDatesByMonth(
        monthList,
        compact(
          assignmentDates.map(a =>
            a.startDate ? parseISO(a.startDate) : undefined
          )
        )
      ),
    [monthList, assignmentDates]
  );

  const checkRegularScheduleForAvailability = (
    regularSchedule: {
      availabilityType: UserAvailability;
      daysOfWeek: DayOfWeek[];
    }[],
    date: Date
  ): UserAvailability | undefined => {
    const dow = getDay(date);
    const dowAvailability = regularSchedule.find(
      x => x?.daysOfWeek[0] === daysOfWeekOrdered[dow]
    );
    return dowAvailability?.availabilityType;
  };

  const { notAvailableDates, beforeDates, afterDates } = useMemo(() => {
    const dates = groupBy(
      eachDayOfInterval({ start: fromDate, end: toDate }),
      d => checkRegularScheduleForAvailability(regularAvailableTime, d)
    );
    return {
      notAvailableDates: dates[UserAvailability.NotAvailable] ?? [],
      beforeDates: dates[UserAvailability.Before] ?? [],
      afterDates: dates[UserAvailability.After] ?? [],
    };
  }, [fromDate, toDate, regularAvailableTime]);

  const unavailableDays = useMemo(
    () =>
      mergeDatesByMonth(
        monthList,
        flatMap(
          notAvailableExceptions.map(e =>
            eachDayOfInterval({
              start: parseISO(e.startDate),
              end: parseISO(e.endDate),
            })
          )
        ).concat(notAvailableDates)
      ),
    [notAvailableExceptions, notAvailableDates, monthList]
  );

  const availableBeforeDates = useMemo(
    () =>
      mergeDatesByMonth(
        monthList,
        beforeExceptions.map(d => parseISO(d.startDate)).concat(beforeDates)
      ),
    [beforeExceptions, beforeDates, monthList]
  );

  const availableAfterDates = useMemo(
    () =>
      mergeDatesByMonth(
        monthList,
        afterExceptions.map(d => parseISO(d.startDate)).concat(afterDates)
      ),
    [afterExceptions, afterDates, monthList]
  );

  if (
    upcomingAssignmentDates.state !== "DONE" &&
    upcomingAssignmentDates.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <Grid container>
      <CalendarLegend calendarView={true} />
      {all.map((group, i) => (
        <AssignmentCalendar
          key={i}
          onSelectDate={props.onSelectDate}
          date={group.month}
          assignmentDates={group.dates}
          selectedDate={props.selectedDate}
          unavailableDates={unavailableDays[i].dates}
          availableBeforeDates={availableBeforeDates[i].dates}
          availableAfterDates={availableAfterDates[i].dates}
        />
      ))}
    </Grid>
  );
};
