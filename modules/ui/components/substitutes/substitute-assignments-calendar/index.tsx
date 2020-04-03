import { Grid } from "@material-ui/core";
import { useQueryBundle, usePagedQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import * as React from "react";
import { useMemo } from "react";
import { GetAssignmentDatesForSubstitute } from "../graphql/get-assignments-dates-for-substitute.gen";
import { AssignmentCalendar } from "./assignment-calendar";
import {
  generateEmptyDateMap,
  mergeAssignmentDatesByMonth,
  mergeUnavailableDatesByMonth,
} from "../grouping-helpers";
import { GetUnavilableTimeExceptions } from "ui/pages/sub-availability/graphql/get-unavailable-exceptions.gen";
import { GetMyAvailableTime } from "ui/pages/sub-availability/graphql/get-available-time.gen";
import { UserAvailability, DayOfWeek } from "graphql/server-types.gen";
import { daysOfWeekOrdered } from "helpers/day-of-week";
import { parseISO, addDays, getDay } from "date-fns";

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

  const emptyAssignmentDateMap = useMemo(
    () => generateEmptyDateMap(fromDate, toDate),
    [fromDate, toDate]
  );

  const emptyUnavailableDateMap = useMemo(
    () => generateEmptyDateMap(fromDate, toDate),
    [fromDate, toDate]
  );

  const emptyAvailableBeforeDateMap = useMemo(
    () => generateEmptyDateMap(fromDate, toDate),
    [fromDate, toDate]
  );

  const emptyAvailableAfterDateMap = useMemo(
    () => generateEmptyDateMap(fromDate, toDate),
    [fromDate, toDate]
  );

  const all = useMemo(() => {
    return mergeAssignmentDatesByMonth(emptyAssignmentDateMap, assignmentDates);
  }, [emptyAssignmentDateMap, assignmentDates]);

  const checkRegularScheduleForDate = (
    regularSchedule: {
      availabilityType: UserAvailability;
      daysOfWeek: DayOfWeek[];
    }[],
    availabilityType: UserAvailability,
    date: Date
  ) => {
    const dow = getDay(date);
    const dowAvailability = regularSchedule.find(
      x => x?.daysOfWeek[0] === daysOfWeekOrdered[dow]
    );
    return dowAvailability?.availabilityType === availabilityType;
  };

  const allExceptionDates = useMemo(() => {
    const all = [] as string[];
    exceptions
      .filter(x => x.availabilityType === UserAvailability.NotAvailable)
      .forEach(e => {
        let startDate = parseISO(e.startDate);
        const endDate = parseISO(e.endDate);
        do {
          all.push(startDate.toISOString());
          startDate = addDays(startDate, 1);
        } while (startDate <= endDate);
      });
    let startDate = fromDate;
    do {
      const isRegularNonWorkDay = checkRegularScheduleForDate(
        regularAvailableTime,
        UserAvailability.NotAvailable,
        startDate
      );
      if (isRegularNonWorkDay) {
        all.push(startDate.toISOString());
      }
      startDate = addDays(startDate, 1);
    } while (startDate <= toDate);
    return all;
  }, [exceptions, fromDate, toDate, regularAvailableTime]);

  const unavailableDays = useMemo(() => {
    return mergeUnavailableDatesByMonth(
      emptyUnavailableDateMap,
      allExceptionDates
    );
  }, [allExceptionDates, emptyUnavailableDateMap]);

  const availableBeforeDates = useMemo(() => {
    const dates = [] as string[];
    exceptions
      .filter(x => x.availabilityType === UserAvailability.Before)
      .forEach(d => dates.push(d.startDate));

    let startDate = fromDate;
    do {
      const isRegularNonWorkDay = checkRegularScheduleForDate(
        regularAvailableTime,
        UserAvailability.Before,
        startDate
      );
      if (isRegularNonWorkDay) {
        dates.push(startDate.toISOString());
      }
      startDate = addDays(startDate, 1);
    } while (startDate <= toDate);

    return mergeUnavailableDatesByMonth(emptyAvailableBeforeDateMap, dates);
  }, [
    exceptions,
    fromDate,
    toDate,
    emptyAvailableBeforeDateMap,
    regularAvailableTime,
  ]);

  const availableAfterDates = useMemo(() => {
    const dates = [] as string[];
    exceptions
      .filter(x => x.availabilityType === UserAvailability.After)
      .forEach(d => dates.push(d.startDate));

    let startDate = fromDate;
    do {
      const isRegularNonWorkDay = checkRegularScheduleForDate(
        regularAvailableTime,
        UserAvailability.After,
        startDate
      );
      if (isRegularNonWorkDay) {
        dates.push(startDate.toISOString());
      }
      startDate = addDays(startDate, 1);
    } while (startDate <= toDate);

    return mergeUnavailableDatesByMonth(emptyAvailableAfterDateMap, dates);
  }, [
    exceptions,
    fromDate,
    toDate,
    emptyAvailableAfterDateMap,
    regularAvailableTime,
  ]);

  if (
    upcomingAssignmentDates.state !== "DONE" &&
    upcomingAssignmentDates.state !== "UPDATING"
  ) {
    return <></>;
  }

  return (
    <Grid container>
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
