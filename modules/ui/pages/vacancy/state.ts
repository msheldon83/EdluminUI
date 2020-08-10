import { Reducer } from "react";

export type VacancyState = {
  vacancyDetailIdsToAssign?: string[];
};

export type VacancyActions = {
  action: "setVacancyDetailIdsToAssign";
  vacancyDetailIdsToAssign: string[];
};

export const vacancyReducer: Reducer<VacancyState, VacancyActions> = (
  prev,
  action
) => {
  switch (action.action) {
    case "setVacancyDetailIdsToAssign": {
      return {
        ...prev,
        vacancyDetailIdsToAssign: action.vacancyDetailIdsToAssign,
      };
    }
  }
};
