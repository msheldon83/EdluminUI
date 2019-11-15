import { Reducer } from "react";
import { DayPart } from "graphql/server-types.gen";

export type CreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  step: "absence" | "substitute";
  viewingCalendarMonth: Date;
};

export type CreateAbsenceActions =
  | {
      action: "switchStep";
      step: "absence" | "substitute";
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
