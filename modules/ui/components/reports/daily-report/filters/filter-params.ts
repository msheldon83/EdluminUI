import { Isomorphism } from "@atomic-object/lenses";
import { format } from "date-fns";

const today = new Date();
export const FilterQueryParamDefaults: DailyReportFilters = {
  date: format(today, "P"),
  locationIds: "",
  positionTypeIds: "",
};

export type DailyReportFilters = {
  date: string;
  locationIds: string;
  positionTypeIds: string;
};

type DailyReportFilterQueryParams = Omit<
  DailyReportFilters,
  "date" | "locationIds" | "positionTypeIds"
> &
  DailyReportQueryFilters;

export type DailyReportQueryFilters = {
  date: string;
  locationIds: number[];
  positionTypeIds: number[];
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
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};

const to = (o: DailyReportFilters): DailyReportQueryFilters => {
  return {
    date: o.date,
    positionTypeIds: stringToNumberArray(o.positionTypeIds),
    locationIds: stringToNumberArray(o.locationIds),
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
  };
};
