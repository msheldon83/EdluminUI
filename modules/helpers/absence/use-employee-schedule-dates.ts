import { useMemo } from "react";
import {
  format,
  addMonths,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  startOfDay,
} from "date-fns";
import { CalendarDayType } from "graphql/server-types.gen";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import {
  GetEmployeeSchedule,
  GetEmployeeScheduleQuery,
  GetEmployeeScheduleQueryVariables,
} from "./get-employee-schedule.gen";
import { compact, flatMap, differenceWith } from "lodash-es";
import {
  GroupEmployeeScheduleByMonth,
  GetEmployeeAbsenceDetails,
  GetContractDates,
  GetPositionScheduleDates,
} from "ui/components/employee/helpers";
import { CalendarScheduleDate } from "ui/components/employee/types";

export const useEmployeeScheduleDates = (
  employeeId: string,
  month: Date,
  startDate?: Date,
  endDate?: Date
) => {
  const fromDate = useMemo(() => {
    if (startDate) {
      return startDate;
    }

    return addMonths(month, -1);
  }, [month, startDate]);

  const toDate = useMemo(() => {
    if (endDate) {
      return endDate;
    }

    return endOfMonth(addMonths(month, 2));
  }, [month, endDate]);

  const employeeSchedule = useQueryBundle(GetEmployeeSchedule, {
    variables: {
      id: employeeId,
      fromDate: format(fromDate, "yyyy-M-d"),
      toDate: format(toDate, "yyyy-M-d"),
    },
    fetchPolicy: "cache-and-network",
  });

  return useMemo(() => {
    const calendarScheduleDates = convertToCalendarScheduleDates(
      employeeSchedule,
      fromDate,
      toDate
    );

    // Add in any missing days as non work days
    const allPossibleDates = eachDayOfInterval({
      start: fromDate,
      end: toDate,
    });
    const missingDates = differenceWith(
      allPossibleDates,
      calendarScheduleDates.map(c => c.date),
      isSameDay
    );
    return calendarScheduleDates.concat(
      missingDates.map(d => {
        return {
          date: startOfDay(d),
          nonWorkDays: [
            {
              date: startOfDay(d),
              calendarDayType: CalendarDayType.NonWorkDay,
              hasCalendarChange: false,
            },
          ],
          absences: [],
          closedDays: [],
          modifiedDays: [],
          contractInstructionalDays: [],
          inServiceDays: [],
        };
      })
    );
  }, [employeeSchedule, fromDate, toDate]);
};

export const convertToCalendarScheduleDates = (
  queryResult: HookQueryResult<
    GetEmployeeScheduleQuery,
    GetEmployeeScheduleQueryVariables
  >,
  startDate: Date,
  endDate: Date
): CalendarScheduleDate[] => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }

  const datesByMonth = GroupEmployeeScheduleByMonth(
    startDate,
    endDate,
    GetEmployeeAbsenceDetails(
      compact(queryResult.data?.employee?.employeeAbsenceSchedule)
    ),
    GetContractDates(
      compact(queryResult.data?.employee?.employeeContractSchedule)
    ),
    GetPositionScheduleDates(
      compact(queryResult.data?.employee?.employeePositionSchedule)
    )
  );

  return flatMap(datesByMonth.map(d => d.dates));
};
