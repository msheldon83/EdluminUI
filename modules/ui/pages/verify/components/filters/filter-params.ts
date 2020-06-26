import { Isomorphism } from "@atomic-object/lenses";
import { format, parse, subDays } from "date-fns";

const today = new Date();

export const FilterQueryParamDefaults: VerifyFilters = {
  // Overview specific
  dateRangeStart: format(subDays(today, 29), "P"),
  dateRangeEnd: format(today, "P"),
  confettiOnFinished: "false",

  //Daily view specific
  date: format(today, "P"),
  showVerified: "false",

  // Shared
  locationIds: "",
  subSource: "",
};

export type VerifyFilters = {
  // Overview specific
  dateRangeStart: string;
  dateRangeEnd: string;
  confettiOnFinished: string;

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
  confettiOnFinished: boolean;

  //Daily view specific
  date: Date;
  showVerified: boolean;

  // Shared
  locationIds: string[];
  subSource?: string;
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
    dateRangeStart: parse(o.dateRangeStart, "MM/dd/yyyy", 0),
    dateRangeEnd: parse(o.dateRangeEnd, "MM/dd/yyyy", 0),
    confettiOnFinished: stringToBool(o.confettiOnFinished, false),
    date: parse(o.date, "MM/dd/yyyy", 0),
    showVerified: stringToBool(o.showVerified, false),
    subSource: o.subSource == "" ? undefined : o.subSource,
    locationIds: o.locationIds === "" ? [] : o.locationIds.split(","),
  };
};

const from = (o: VerifyQueryFilters): VerifyFilters => {
  return {
    dateRangeStart: format(o.dateRangeStart, "P"),
    dateRangeEnd: format(o.dateRangeEnd, "P"),
    confettiOnFinished: boolToString(o.confettiOnFinished),
    date: format(o.date, "P"),
    showVerified: boolToString(o.showVerified),
    subSource: o.subSource ?? "",
    locationIds: o.locationIds.length == 0 ? "" : o.locationIds.join(","),
  };
};
