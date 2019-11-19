import { Reducer } from "react";

export type CreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  step: "absence" | "assignSub";
  viewingCalendarMonth: Date;
};

export type CreateAbsenceActions =
  | {
      action: "switchStep";
      step: "absence" | "assignSub";
    }
  | { action: "switchMonth"; month: Date };

export const createAbsenceReducer: Reducer<
  CreateAbsenceState,
  CreateAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "switchStep": {
      return { ...prev, step: action.step };
    }
    case "switchMonth": {
      return { ...prev, viewingCalendarMonth: action.month };
    }
  }
};
