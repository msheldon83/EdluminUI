import { Isomorphism } from "@atomic-object/lenses";
import { format } from "date-fns";

const today = new Date();
export const FilterQueryParamDefaults: DailyReportFilters = {
  date: format(today, "P"),
  locationIds: "",
  positionTypeIds: "",
  showAbsences: "true",
  showVacancies: "true",
};

export type DailyReportFilters = {
  date: string;
  locationIds: string;
  positionTypeIds: string;
  showAbsences: string;
  showVacancies: string;
};

type DailyReportFilterQueryParams = Omit<
  DailyReportFilters,
  "date" | "locationIds" | "positionTypeIds" | "showAbsences" | "showVacancies"
> &
  DailyReportQueryFilters;

export type DailyReportQueryFilters = {
  date: string;
  locationIds: number[];
  positionTypeIds: number[];
  showAbsences: boolean;
  showVacancies: boolean;
};

export const FilterParams: Isomorphism<
  DailyReportFilters,
  DailyReportFilterQueryParams
> = {
  to: k => ({
    ...to(k),
  }),
  from: s => ({
    ...FilterQueryParamDefaults,
    ...from(s),
    showAbsences: boolToString(s.showAbsences),
    showVacancies: boolToString(s.showVacancies),
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};

export const stringToBool = (s: string, defaultValue: boolean): boolean => {
  switch (s) {
    case "true":
      return true;
    case "false":
      return false;
    case "":
    default:
      return defaultValue;
  }
};
const boolToString = (b: boolean): "true" | "false" | "" => {
  switch (b) {
    case true:
      return "true";
    case false:
      return "false";
    case undefined:
      return "";
  }
};

const to = (o: DailyReportFilters): DailyReportQueryFilters => {
  return {
    date: o.date,
    positionTypeIds: stringToNumberArray(o.positionTypeIds),
    locationIds: stringToNumberArray(o.locationIds),
    showAbsences: stringToBool(o.showAbsences, true),
    showVacancies: stringToBool(o.showVacancies, true),
  };
};

const stringToNumberArray = (s: string): number[] => {
  return s === "" ? [] : s.split(",").map(e => Number(e));
};

const from = (o: DailyReportQueryFilters) => {
  return {
    date: o.date,
    locationIds: o.locationIds.join(","),
    positionTypeIds: o.positionTypeIds.join(","),
    showAbsences: o.showAbsences,
    showVacancies: o.showVacancies,
  };
};
