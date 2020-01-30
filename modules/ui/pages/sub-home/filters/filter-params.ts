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
  orgIds: string[];
  locationIds: string[];
  positionTypeIds: string[];
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
    positionTypeIds:
      o.positionTypeIds === "" ? [] : o.positionTypeIds.split(","),
    locationIds: o.locationIds === "" ? [] : o.locationIds.split(","),
    orgIds: o.orgIds === "" ? [] : o.orgIds.split(","),
    times: o.times.split(","),
  };
};

const from = (o: SubHomeQueryFilters) => {
  return {
    orgIds: o.orgIds.join(","),
    locationIds: o.locationIds.join(","),
    positionTypeIds: o.positionTypeIds.join(","),
    times: o.times.join(","),
  };
};
