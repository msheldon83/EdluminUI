import { Isomorphism } from "@atomic-object/lenses";
import { format } from "date-fns";

const today = new Date();
export const groupOptions = ["fillStatus", "positionType", "school"] as const;
export type GroupOption = typeof groupOptions[number];

export const FilterQueryParamDefaults: DailyReportFilters = {
  date: format(today, "P"),
  locationIds: "",
  positionTypeIds: "",
  showAbsences: "true",
  showVacancies: "true",
  groupDetailsBy: "fillStatus",
  subGroupDetailsBy: "positionType",
};

export type DailyReportFilters = {
  date: string;
  locationIds: string;
  positionTypeIds: string;
  showAbsences: string;
  showVacancies: string;
  groupDetailsBy: string;
  subGroupDetailsBy: string;
};

type DailyReportFilterQueryParams = Omit<
  DailyReportFilters,
  | "date"
  | "locationIds"
  | "positionTypeIds"
  | "showAbsences"
  | "showVacancies"
  | "groupDetailsBy"
  | "subGroupDetailsBy"
> &
  DailyReportQueryFilters;

export type DailyReportQueryFilters = {
  date: string;
  locationIds: string[];
  positionTypeIds: string[];
  showAbsences: boolean;
  showVacancies: boolean;
  groupDetailsBy: GroupOption;
  subGroupDetailsBy?: GroupOption;
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
export const stringToGroupOption: (
  s: string,
  defaultValue: GroupOption
) => GroupOption = (s, defaultValue) => {
  const option = groupOptions.find(o => o === s);
  return option ?? defaultValue;
};

const to = (o: DailyReportFilters): DailyReportQueryFilters => {
  return {
    date: o.date,
    positionTypeIds:
      o.positionTypeIds === "" ? [] : o.positionTypeIds.split(","),
    locationIds: o.locationIds === "" ? [] : o.locationIds.split(","),
    showAbsences: stringToBool(o.showAbsences, true),
    showVacancies: stringToBool(o.showVacancies, true),
    groupDetailsBy: stringToGroupOption(o.groupDetailsBy, "fillStatus"),
    subGroupDetailsBy:
      o.subGroupDetailsBy == ""
        ? undefined
        : stringToGroupOption(o.subGroupDetailsBy, "positionType"),
  };
};

const from = (o: DailyReportQueryFilters) => {
  return {
    date: o.date,
    locationIds: o.locationIds.join(","),
    positionTypeIds: o.positionTypeIds.join(","),
    showAbsences: o.showAbsences,
    showVacancies: o.showVacancies,
    groupDetailsBy: o.groupDetailsBy,
    subGroupDetailsBy: o.subGroupDetailsBy ?? "",
  };
};
