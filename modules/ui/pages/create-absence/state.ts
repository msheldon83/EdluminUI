import { Reducer } from "react";

export type CreateAbsenceState = {
  preselectedEmployee: boolean;
  employeeId?: string;
  step: "employee" | "absence" | "substitute";
};

export type CreateAbsenceActions = {
  action: "selectEmployee";
  employeeId: string;
};

export const createAbsenceReducer: Reducer<
  CreateAbsenceState,
  CreateAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "selectEmployee": {
      return { ...prev, employeeId: action.employeeId, step: "absence" };
    }
  }
  return prev;
};
