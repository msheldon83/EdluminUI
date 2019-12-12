import { useMemo } from "react";
import { format, addMonths, endOfMonth } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import { GetEmployeeContractSchedule } from "./get-employee-contract-schedule.gen";
import { computeDisabledDates } from "./computeDisabledDates";

export const useEmployeeDisabledDates = (employeeId: string, month: Date) => {
  const contractSchedule = useQueryBundle(GetEmployeeContractSchedule, {
    variables: {
      id: employeeId,
      fromDate: format(addMonths(month, -1), "yyyy-M-d"),
      toDate: format(endOfMonth(addMonths(month, 2)), "yyyy-M-d"),
    },
  });

  return useMemo(() => computeDisabledDates(contractSchedule), [
    contractSchedule,
  ]);
};
