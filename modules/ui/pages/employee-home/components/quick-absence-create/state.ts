import { startOfDay } from "date-fns";
import { isSameDay } from "date-fns/esm";
import { differenceWith, filter, find } from "lodash-es";
import { Reducer } from "react";

export type QuickCreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  viewingCalendarMonth: Date;
  needsReplacement: boolean;
  selectedAbsenceDates: Date[];
};

export type QuickCreateAbsenceActions =
  | { action: "switchMonth"; month: Date }
  | { action: "setNeedsReplacement"; to: boolean }
  | { action: "toggleDate"; date: Date }
  | { action: "removeAbsenceDates"; dates: Date[] };

export const quickCreateAbsenceReducer: Reducer<
  QuickCreateAbsenceState,
  QuickCreateAbsenceActions
> = (prev, action) => {
  switch (action.action) {
    case "switchMonth": {
      return { ...prev, viewingCalendarMonth: action.month };
    }
    case "setNeedsReplacement": {
      return { ...prev, needsReplacement: action.to };
    }
    case "toggleDate": {
      const date = startOfDay(action.date);
      if (find(prev.selectedAbsenceDates, d => isSameDay(d, date))) {
        return {
          ...prev,
          vacanciesInput: undefined,
          selectedAbsenceDates: filter(
            prev.selectedAbsenceDates,
            d => !isSameDay(d, date)
          ),
        };
      } else {
        return {
          ...prev,
          vacanciesInput: undefined,
          selectedAbsenceDates: [...prev.selectedAbsenceDates, date],
        };
      }
    }
    case "removeAbsenceDates": {
      return {
        ...prev,
        selectedAbsenceDates: differenceWith(
          prev.selectedAbsenceDates,
          action.dates,
          isSameDay
        ),
      };
    }
  }
};
