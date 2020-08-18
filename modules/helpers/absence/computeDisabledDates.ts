import { HookQueryResult } from "graphql/hooks";
import {
  GetEmployeeScheduleQuery,
  GetEmployeeScheduleQueryVariables,
} from "./get-employee-schedule.gen";
import { CalendarDayType } from "graphql/server-types.gen";
import { startOfDay, parseISO } from "date-fns";

export type DisabledDate = {
  date: Date;
  type: "nonWorkDay" | "absence";
  startTime?: Date;
  endTime?: Date;
};

export const computeDisabledDates = (
  queryResult: HookQueryResult<
    GetEmployeeScheduleQuery,
    GetEmployeeScheduleQueryVariables
  >
): DisabledDate[] => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates: DisabledDate[] = [];
  queryResult.data.employee?.employeeContractSchedule?.forEach(contractDate => {
    switch (contractDate?.calendarDayTypeId) {
      case CalendarDayType.CancelledDay:
      case CalendarDayType.Invalid:
      case CalendarDayType.NonWorkDay: {
        const theDate = startOfDay(parseISO(contractDate.date));
        dates.push({
          date: theDate,
          type: "nonWorkDay",
        });
      }
    }
  });
  queryResult.data.employee?.employeeAbsenceSchedule?.forEach(absence => {
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
