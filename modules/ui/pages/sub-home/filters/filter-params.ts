import { Isomorphism } from "@atomic-object/lenses";

export const FilterQueryParamDefaults: SubHomeFilters = {
  orgIds: "",
  positionTypeIds: "",
  locationIds: "",
  times: "",
};

export type SubHomeFilters = {
  orgIds: string;
  positionTypeIds: string;
  locationIds: string;
  times: string;
};

type SubHomeFilterQueryParams = Omit<
  SubHomeFilters,
  "orgIds" | "positionTypeIds" | "locationIds" | "times"
> &
  SubHomeQueryFilters;

export type SubHomeQueryFilters = {
  orgIds: number[];
  locationIds: number[];
  positionTypeIds: number[];
  times: string[];
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
    positionTypeIds: stringToNumberArray(o.positionTypeIds),
    locationIds: stringToNumberArray(o.locationIds),
    orgIds: stringToNumberArray(o.orgIds),
    times: o.times.split(","),
  };
};

const stringToNumberArray = (s: string): number[] => {
  return s === "" ? [] : s.split(",").map(e => Number(e));
};

const from = (o: SubHomeQueryFilters) => {
  return {
    orgIds: o.orgIds.join(","),
    locationIds: o.locationIds.join(","),
    positionTypeIds: o.positionTypeIds.join(","),
    times: o.times.join(","),
  };
};
