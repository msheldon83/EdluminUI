import { Isomorphism } from "@atomic-object/lenses";
import { DayPart } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: SubHomeFilters = {
  orgs: "",
  positionTypes: "",
  locations: "",
  times: "",
};

export type SubHomeFilters = {
  orgs: string;
  positionTypes: string;
  locations: string;
  times: string;
};

type SubHomeFilterQueryParams = Omit<
  SubHomeFilters,
  "orgs" | "positionTypes" | "locations" | "times"
> &
  SubHomeQueryFilters;

export type SubHomeQueryFilters = {
  orgs: number[];
  locations: number[];
  positionTypes: number[];
  times: DayPart[];
};

export const FilterParams: Isomorphism<
  SubHomeFilters,
  SubHomeFilterQueryParams
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

const to = (o: SubHomeFilters): SubHomeQueryFilters => {
  return {
    positionTypes: stringToNumberArray(o.positionTypes),
    locations: stringToNumberArray(o.locations),
    orgs: stringToNumberArray(o.orgs),
    times: o.times,
  };
};

const stringToNumberArray = (s: string): number[] => {
  return s === "" ? [] : s.split(",").map(e => Number(e));
};

const from = (o: SubHomeQueryFilters) => {
  return {
    orgs: o.orgs.join(","),
    locations: o.locations.join(","),
    positionTypes: o.positionTypes.join(","),
  };
};
