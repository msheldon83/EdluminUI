import { Reducer } from "react";

export type CreateAbsenceState = {
  preselectedEmployee: boolean;
  employeeId?: string;
  step: "absence" | "substitute";
  startDate: Date;
  endDate: Date;
};

export type CreateAbsenceActions =
  | {
      action: "selectEmployee";
      employeeId: string;
    }
  | { action: "selectDates"; startDate: Date; endDate: Date };

export const createAbsenceReducer: Reducer<
  CreateAbsenceState,
  CreateAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "selectEmployee": {
      return { ...prev, employeeId: action.employeeId, step: "absence" };
    }
    case "selectDates": {
      const { startDate, endDate } = action;
      return { ...prev, startDate, endDate };
    }
  }
  return prev;
};
