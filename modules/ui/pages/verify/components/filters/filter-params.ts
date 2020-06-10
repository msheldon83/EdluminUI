import { Isomorphism } from "@atomic-object/lenses";
import { format, subDays } from "date-fns";

const today = new Date();

export const FilterQueryParamDefaults: VerifyFilters = {
  // Overview specific
  dateRangeStart: format(subDays(today, 29), "P"),
  dateRangeEnd: format(today, "P"),

  //Daily view specific
  date: format(today, "P"),
  showVerified: "true",

  // Shared
  locationIds: "",
  subSource: "",
};

export type VerifyFilters = {
  // Overview specific
  dateRangeStart: string;
  dateRangeEnd: string;

  //Daily view specific
  date: string;
  showVerified: string;

  // Shared
  locationIds: string;
  subSource: string;
};

export type VerifyQueryFilters = {
  // Overview specific
  dateRangeStart: Date;
  dateRangeEnd: Date;

  //Daily view specific
  date: Date;
  showVerified: boolean;

  // Shared
  locationIds: string[];
  subSource: string;
};

export const FilterParams: Isomorphism<VerifyFilters, VerifyQueryFilters> = {
  to: queryFilters => ({
    ...queryFilters,
    ...to(queryFilters),
  }),
  from: filters => ({
    ...from(filters),
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

const to = (o: VerifyFilters): VerifyQueryFilters => {
  return {
    dateRangeStart: new Date(o.dateRangeStart),
    dateRangeEnd: new Date(o.dateRangeEnd),
    date: new Date(o.date),
    showVerified: stringToBool(o.showVerified, true),
    subSource: o.subSource,
    locationIds: o.locationIds === "" ? [] : o.locationIds.split(","),
  };
};

const from = (o: VerifyQueryFilters): VerifyFilters => {
  return {
    dateRangeStart: format(o.dateRangeStart, "P"),
    dateRangeEnd: format(o.dateRangeEnd, "P"),
    date: format(o.date, "P"),
    showVerified: boolToString(o.showVerified),
    subSource: o.subSource,
    locationIds: o.locationIds.length == 0 ? "" : o.locationIds.join(","),
  };
};
