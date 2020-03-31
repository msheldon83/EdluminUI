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
import { UserAvailability } from "graphql/server-types.gen";
import { parseISO, startOfDay, addDays } from "date-fns";

type Props = {
  userId?: string;
  orgId?: string;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  fromDate: Date;
  toDate: Date;
};

export const SubstituteAssignmentsCalendarView: React.FC<Props> = props => {
  const [getExceptions, _] = usePagedQueryBundle(
    GetUnavilableTimeExceptions,
    r => r.user?.pagedUserUnavailableTime?.totalCount,
    {
      variables: {
        userId: props.userId ?? "",
        fromDate: props.fromDate,
        toDate: props.toDate,
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

  const upcomingAssignmentDates = useQueryBundle(
    GetAssignmentDatesForSubstitute,
    {
      variables: {
        id: String(props.userId),
        organizationId: props.orgId ?? null,
        fromDate: props.fromDate,
        toDate: props.toDate,
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
    () => generateEmptyDateMap(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const emptyUnavailableDateMap = useMemo(
    () => generateEmptyDateMap(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const emptyAvailableBeforeDateMap = useMemo(
    () => generateEmptyDateMap(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const emptyAvailableAfterDateMap = useMemo(
    () => generateEmptyDateMap(props.fromDate, props.toDate),
    [props.fromDate, props.toDate]
  );

  const all = useMemo(() => {
    return mergeAssignmentDatesByMonth(emptyAssignmentDateMap, assignmentDates);
  }, [emptyAssignmentDateMap, assignmentDates]);

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
    return all;
  }, [exceptions]);

  const unavailableDays = useMemo(() => {
    return mergeUnavailableDatesByMonth(
      emptyUnavailableDateMap,
      allExceptionDates
    );
  }, [allExceptionDates, emptyUnavailableDateMap]);

  const availableBeforeDates = useMemo(() => {
    const dates = exceptions
      .filter(x => x.availabilityType === UserAvailability.Before)
      .map(d => d.startDate);

    return mergeUnavailableDatesByMonth(emptyAvailableBeforeDateMap, dates);
  }, [exceptions, emptyAvailableBeforeDateMap]);

  const availableAfterDates = useMemo(() => {
    const dates = exceptions
      .filter(x => x.availabilityType === UserAvailability.After)
      .map(d => d.startDate);

    return mergeUnavailableDatesByMonth(emptyAvailableAfterDateMap, dates);
  }, [exceptions, emptyAvailableAfterDateMap]);

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
