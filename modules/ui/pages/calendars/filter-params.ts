import { Isomorphism } from "@atomic-object/lenses";
import { format } from "date-fns";

const today = new Date();
export const groupOptions = ["schoolyear", "contract", "school"] as const;
export type GroupOption = typeof groupOptions[number];

export const FilterQueryParamDefaults: CalendarChangeFilters = {
  date: format(today, "P"),
  locationId: "",
  contractId: "",
  schoolYearId: "",
};

export type CalendarChangeFilters = {
  date: string;
  locationId: string;
  contractId: string;
  schoolYearId: string;
};

type CalendarChangeFilterQueryParams = Omit<
  CalendarChangeFilters,
  "date" | "locationId" | "contractId" | "schoolYearId"
> &
  CalendarChangeQueryFilters;

export type CalendarChangeQueryFilters = {
  date: string;
  locationId: string;
  contractId: string;
  schoolYearId: string;
};

export const FilterParams: Isomorphism<
  CalendarChangeFilters,
  CalendarChangeFilterQueryParams
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
export const stringToGroupOption: (
  s: string,
  defaultValue: GroupOption
) => GroupOption = (s, defaultValue) => {
  const option = groupOptions.find(o => o === s);
  return option ?? defaultValue;
};

const to = (o: CalendarChangeFilters): CalendarChangeQueryFilters => {
  return {
    date: o.date,
    contractId: o.contractId,
    schoolYearId: o.schoolYearId,
    locationId: o.locationId,
  };
};

const from = (o: CalendarChangeQueryFilters) => {
  return {
    date: o.date,
    locationId: o.locationId,
    contractId: o.contractId,
  };
};
