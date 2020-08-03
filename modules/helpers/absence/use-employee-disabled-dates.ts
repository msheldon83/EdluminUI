import { useMemo } from "react";
import { format, addMonths, endOfMonth } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeContractSchedule } from "./get-employee-contract-schedule.gen";
import { computeDisabledDates } from "./computeDisabledDates";

export const useEmployeeDisabledDates = (
  employeeId: string,
  month: Date,
  startDate?: Date
) => {
  const fromDate = useMemo(() => {
    if (startDate) {
      return format(startDate, "yyyy-M-d");
    }

    return format(addMonths(month, -1), "yyyy-M-d");
  }, [month, startDate]);

  const contractSchedule = useQueryBundle(GetEmployeeContractSchedule, {
    variables: {
      id: employeeId,
      fromDate: fromDate,
      toDate: format(endOfMonth(addMonths(month, 2)), "yyyy-M-d"),
    },
    fetchPolicy: "cache-and-network",
  });

  return useMemo(() => computeDisabledDates(contractSchedule), [
    contractSchedule,
  ]);
};
