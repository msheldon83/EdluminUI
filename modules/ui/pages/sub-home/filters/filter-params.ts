import { Isomorphism } from "@atomic-object/lenses";
import { PreferenceFilter } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: SubHomeFilters = {
  orgIds: "",
  positionTypeIds: "",
  locationIds: "",
  times: "",
  preferenceFilter: "SHOW_FAVORITES_AND_DEFAULT",
};

export type SubHomeFilters = {
  orgIds: string;
  positionTypeIds: string;
  locationIds: string;
  times: string;
  preferenceFilter: string;
};

type SubHomeFilterQueryParams = Omit<
  SubHomeFilters,
  "orgIds" | "positionTypeIds" | "locationIds" | "times" | "preferenceFilter"
> & {
  preferenceFilter: PreferenceFilter;
} & SubHomeQueryFilters;

export type SubHomeQueryFilters = {
  orgIds: string[];
  locationIds: string[];
  positionTypeIds: string[];
  times: string[];
  preferenceFilter: PreferenceFilter;
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
    preferenceFilter: getFilter(o.preferenceFilter),
  };
};

const from = (o: SubHomeQueryFilters) => {
  return {
    orgIds: o.orgIds.join(","),
    locationIds: o.locationIds.join(","),
    positionTypeIds: o.positionTypeIds.join(","),
    times: o.times.join(","),
    preferenceFilter: o.preferenceFilter,
  };
};

const getFilter = (stringValue: string): PreferenceFilter =>
  (Object.values(PreferenceFilter) as PreferenceFilter[]).find(
    v => v == stringValue
  ) ?? PreferenceFilter.Invalid;
