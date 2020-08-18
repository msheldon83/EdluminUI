import { useMemo } from "react";
import { format, parseISO, isValid } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeScheduleTimes } from "./get-employee-schedule-times.gen";
import { PositionScheduleDate } from "graphql/server-types.gen";

export type ScheduleTimes = {
  date: Date;
  startTime: string;
  halfDayMorningEnd: string | null;
  halfDayAfternoonStart: string | null;
  endTime: string;
};

export const useEmployeeScheduleTimes = (
  employeeId: string,
  fromDate: Date | undefined,
  toDate: Date | undefined
): ScheduleTimes[] => {
  const fromDateForQuery = useMemo(() => {
    return fromDate && isValid(fromDate) ? format(fromDate, "P") : undefined;
  }, [fromDate]);

  const toDateForQuery = useMemo(() => {
    const dateToUse = toDate && isValid(toDate) ? toDate : fromDate;
    return dateToUse && isValid(dateToUse) ? format(dateToUse, "P") : undefined;
  }, [fromDate, toDate]);

  const getEmployeeScheduleTimes = useQueryBundle(GetEmployeeScheduleTimes, {
    variables: {
      id: employeeId,
      fromDate: fromDateForQuery,
      toDate: toDateForQuery,
    },
    skip: !fromDateForQuery,
  });

  return useMemo(() => {
    if (
      getEmployeeScheduleTimes.state === "DONE" ||
      getEmployeeScheduleTimes.state === "UPDATING"
    ) {
      const scheduleTimes =
        getEmployeeScheduleTimes.data?.employee?.employeePositionSchedule &&
        getEmployeeScheduleTimes.data?.employee?.employeePositionSchedule
          .length > 0
          ? (getEmployeeScheduleTimes.data?.employee
              ?.employeePositionSchedule as Pick<
              PositionScheduleDate,
              | "startTimeLocal"
              | "endTimeLocal"
              | "halfDayMorningEndLocal"
              | "halfDayAfternoonStartLocal"
            >[])
          : undefined;

      return (
        scheduleTimes?.map(s => {
          return {
            date: parseISO(s.startTimeLocal),
            startTime: format(parseISO(s.startTimeLocal), "h:mm a"),
            halfDayMorningEnd: s.halfDayMorningEndLocal
              ? format(parseISO(s.halfDayMorningEndLocal), "h:mm a")
              : null,
            halfDayAfternoonStart: s.halfDayAfternoonStartLocal
              ? format(parseISO(s.halfDayAfternoonStartLocal), "h:mm a")
              : null,
            endTime: format(parseISO(s.endTimeLocal), "h:mm a"),
          };
        }) ?? []
      );
    } else {
      return [];
    }
  }, [getEmployeeScheduleTimes]);
};
