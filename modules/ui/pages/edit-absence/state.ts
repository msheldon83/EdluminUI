import { Reducer } from "react";
import { VacancyDetail } from "ui/components/absence/types";
import { isSameDay, startOfDay } from "date-fns";
import { filter, find, sortBy } from "lodash-es";

export type EditAbsenceState = {
  employeeId: string;
  absenceId: string;
  viewingCalendarMonth: Date;
  needsReplacement: boolean;
  absenceDates: Date[];
  customizedVacanciesInput?: VacancyDetail[];
};

export type EditAbsenceActions =
  | { action: "switchMonth"; month: Date }
  | { action: "setNeedsReplacement"; to: boolean }
  | { action: "toggleDate"; date: Date }
  | { action: "setVacanciesInput"; input: undefined | VacancyDetail[] };

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
    case "toggleDate": {
      const date = startOfDay(action.date);
      if (find(prev.absenceDates, d => isSameDay(d, date))) {
        return {
          ...prev,
          customizedVacanciesInput: undefined,
          absenceDates: filter(prev.absenceDates, d => !isSameDay(d, date)),
        };
      } else {
        return {
          ...prev,
          customizedVacanciesInput: undefined,
          absenceDates: sortBy([...prev.absenceDates, date]),
        };
      }
    }
    case "setVacanciesInput": {
      return { ...prev, customizedVacanciesInput: action.input };
    }
  }
};
