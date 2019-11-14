import { Reducer } from "react";
import { DayPart } from "graphql/server-types.gen";

export type CreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  step: "absence" | "assignSub";
};

export type CreateAbsenceActions = {
  action: "switchStep";
  step: "absence" | "assignSub";
};

export const createAbsenceReducer: Reducer<
  CreateAbsenceState,
  CreateAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "switchStep": {
      return { ...prev, step: action.step };
    }
  }
  return prev;
};
