import { Reducer } from "react";

export type EditAbsenceState = {
  employeeId: string;
  absenceId: string;
  viewingCalendarMonth: Date;
  needsReplacement: boolean;
};

export type EditAbsenceActions =
  | { action: "switchMonth"; month: Date }
  | { action: "setNeedsReplacement"; to: boolean };

export const editAbsenceReducer: Reducer<
  EditAbsenceState,
  EditAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "switchMonth": {
      return { ...prev, viewingCalendarMonth: action.month };
    }
    case "setNeedsReplacement": {
      return { ...prev, needsReplacement: action.to };
    }
  }
};
