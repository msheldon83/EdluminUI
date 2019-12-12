import { HookQueryResult } from "graphql/hooks";
import {
  GetEmployeeContractScheduleQuery,
  GetEmployeeContractScheduleQueryVariables,
} from "./get-employee-contract-schedule.gen";
import { CalendarDayType } from "graphql/server-types.gen";
import { startOfDay, parseISO, eachDayOfInterval } from "date-fns";

export const computeDisabledDates = (
  queryResult: HookQueryResult<
    GetEmployeeContractScheduleQuery,
    GetEmployeeContractScheduleQueryVariables
  >
) => {
  if (queryResult.state !== "DONE" && queryResult.state !== "UPDATING") {
    return [];
  }
  const dates = new Set<Date>();
  queryResult.data.employee?.employeeContractSchedule?.forEach(contractDate => {
    switch (contractDate?.calendarDayTypeId) {
      case CalendarDayType.CancelledDay:
      case CalendarDayType.Invalid:
      case CalendarDayType.NonWorkDay: {
        const theDate = startOfDay(parseISO(contractDate.date));
        dates.add(theDate);
      }
    }
  });
  queryResult.data.employee?.employeeAbsenceSchedule?.forEach(absence => {
    const startDate = absence?.startDate;
    const endDate = absence?.endDate;
    if (startDate && endDate) {
      eachDayOfInterval({
        start: parseISO(startDate),
        end: parseISO(endDate),
      }).forEach(day => {
        dates.add(startOfDay(day));
      });
    }
  });
  return [...dates];
};
