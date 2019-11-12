import { Reducer } from "react";
import { DayPart } from "graphql/server-types.gen";

export type CreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  step: "absence" | "substitute";
  startDate: Date;
  endDate: Date;
  dayPart?: DayPart;
  absenceReason?: string;
};

export type CreateAbsenceActions =
  | {
      action: "selectEmployee";
      employeeId: string;
    }
  | { action: "selectDates"; startDate: Date; endDate: Date }
  | { action: "selectAbsenceTimeType"; dayPart: DayPart };

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
    case "selectAbsenceTimeType": {
      return { ...prev, dayPart: action.dayPart };
    }
  }
  return prev;
};
