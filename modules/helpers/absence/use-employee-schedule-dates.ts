import { useMemo } from "react";
import {
  format,
  addMonths,
  endOfMonth,
  startOfDay,
  parseISO,
  eachDayOfInterval,
  isSameDay,
} from "date-fns";
import { useQueryBundle, HookQueryResult } from "graphql/hooks";
import {
  GetEmployeeSchedule,
  GetEmployeeScheduleQuery,
  GetEmployeeScheduleQueryVariables,
} from "./get-employee-schedule.gen";
import { compact, differenceWith } from "lodash-es";
import { CalendarDayType } from "graphql/server-types.gen";

export const useEmployeeScheduleDates = (
  employeeId: string,
  month: Date,
  startDate?: Date
) => {
  const fromDate = useMemo(() => {
    if (startDate) {
      return startDate;
    }

    return addMonths(month, -1);
  }, [month, startDate]);

  const toDate = useMemo(() => endOfMonth(addMonths(month, 2)), [month]);

  const contractSchedule = useQueryBundle(GetEmployeeSchedule, {
    variables: {
      id: employeeId,
      fromDate: format(fromDate, "yyyy-M-d"),
      toDate: format(toDate, "yyyy-M-d"),
    },
    fetchPolicy: "cache-and-network",
  });

  return useMemo(() => {
    const contractDates = convertToEmployeeContractDates(contractSchedule);
    // Add in any missing days as non work days
    const allPossibleDates = eachDayOfInterval({
      start: fromDate,
      end: toDate,
    });
    const missingDates = differenceWith(
      allPossibleDates,
      contractDates.map(c => c.date),
      isSameDay
    );
    return contractDates.concat(
      missingDates.map(d => {
        return { date: startOfDay(d), type: "nonWorkDay" };
      })
    );
  }, [contractSchedule, fromDate, toDate]);
};

export type EmployeeContractDate = {
  date: Date;
  type: DateType;
  startTime?: Date;
  endTime?: Date;
};

type DateType =
  | "nonWorkDay"
  | "absence"
  | "closed"
  | "modified"
  | "inservice"
  | "instructional";

export const convertToEmployeeContractDates = (
  queryResult: HookQueryResult<
    GetEmployeeScheduleQuery,
    GetEmployeeScheduleQueryVariables
  >
): EmployeeContractDate[] => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates: EmployeeContractDate[] = [];
  compact(queryResult.data?.employee?.employeeContractSchedule).forEach(
    contractDate => {
      let type: DateType | undefined = undefined;
      const calendarDayType =
        contractDate.calendarChange?.calendarChangeReason?.calendarDayTypeId ??
        contractDate.calendarDayTypeId;
      switch (calendarDayType) {
        case CalendarDayType.NonWorkDay:
          type = contractDate.calendarChangeId ? "closed" : "nonWorkDay";
          break;
        case CalendarDayType.TeacherWorkDay:
          type = "inservice";
          break;
        case CalendarDayType.CancelledDay:
          type = "closed";
          break;
        case CalendarDayType.InstructionalDay:
          type = contractDate.calendarChangeId ? "modified" : "instructional";
          break;
        default:
          break;
      }

      if (type) {
        dates.push({
          date: startOfDay(parseISO(contractDate.date)),
          type: type,
        });
      }
    }
  );
  queryResult.data?.employee?.employeeAbsenceSchedule?.forEach(absence => {
    absence?.details?.forEach(detail => {
      if (detail) {
        dates.push({
          date: startOfDay(parseISO(detail.startDate)),
          type: "absence",
          startTime: parseISO(detail.startTimeLocal),
          endTime: parseISO(detail.endTimeLocal),
        });
      }
    });
  });

  return dates;
};
