import { startOfDay } from "date-fns";
import { isSameDay } from "date-fns/esm";
import { differenceWith, filter, find } from "lodash-es";
import { Reducer } from "react";
import { VacancyDetail } from "ui/components/absence/types";

export type CreateAbsenceState = {
  employeeId: string;
  organizationId: string;
  viewingCalendarMonth: Date;
  needsReplacement: boolean;
  absenceDates: Date[];
  vacanciesInput?: VacancyDetail[];
};

export type CreateAbsenceActions =
  | { action: "switchMonth"; month: Date }
  | { action: "setNeedsReplacement"; to: boolean }
  | { action: "toggleDate"; date: Date }
  | { action: "setVacanciesInput"; input: undefined | VacancyDetail[] }
  | { action: "removeAbsenceDates"; dates: Date[] };

export const createAbsenceReducer: Reducer<
  CreateAbsenceState,
  CreateAbsenceActions
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
      if (find(prev.absenceDates, d => isSameDay(d, date))) {
        return {
          ...prev,
          vacanciesInput: undefined,
          absenceDates: filter(prev.absenceDates, d => !isSameDay(d, date)),
        };
      } else {
        return {
          ...prev,
          vacanciesInput: undefined,
          absenceDates: [...prev.absenceDates, date],
        };
      }
    }
    case "setVacanciesInput": {
      return { ...prev, vacanciesInput: action.input };
    }
    case "removeAbsenceDates": {
      return {
        ...prev,
        absenceDates: differenceWith(
          prev.absenceDates,
          action.dates,
          isSameDay
        ),
      };
    }
  }
};
