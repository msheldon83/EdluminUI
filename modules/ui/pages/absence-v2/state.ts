import { isSameDay, startOfDay } from "date-fns";
import { differenceWith, filter, find, sortBy } from "lodash-es";
import { Reducer } from "react";
import { VacancyDetail } from "ui/components/absence/types";

export type AbsenceState = {
  employeeId: string;
  organizationId: string;
  positionId: string;
  viewingCalendarMonth: Date;
  absenceDates: Date[];
  customizedVacanciesInput?: VacancyDetail[];
  absenceId?: string;
  absenceRowVersion?: string;
  isClosed?: boolean;
  closedDates: Date[];
};

export type AbsenceActions =
  | { action: "switchMonth"; month: Date }
  | { action: "toggleDate"; date: Date }
  | { action: "setVacanciesInput"; input: undefined | VacancyDetail[] }
  | { action: "removeAbsenceDates"; dates: Date[] }
  | { action: "resetAfterSave" }
  | { action: "resetToInitialState"; initialState: AbsenceState };

export const absenceReducer: Reducer<AbsenceState, AbsenceActions> = (
  prev,
  action
) => {
  switch (action.action) {
    case "switchMonth": {
      return { ...prev, viewingCalendarMonth: action.month };
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
    case "resetAfterSave": {
      return { ...prev, customizedVacanciesInput: undefined };
    }
    case "resetToInitialState": {
      return action.initialState;
    }
  }
};
