import { Reducer } from "react";

export type CreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  viewingCalendarMonth: Date;
};

export type CreateAbsenceActions = { action: "switchMonth"; month: Date };

export const createAbsenceReducer: Reducer<
  CreateAbsenceState,
  CreateAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "switchMonth": {
      return { ...prev, viewingCalendarMonth: action.month };
    }
  }
};
