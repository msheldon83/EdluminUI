import { Isomorphism } from "@atomic-object/lenses";

export const FilterQueryParamDefaults: LocationFilter = {
  location: "",
};

export type LocationFilter = {
  location: string;
};

type LocationFilterQueryParams = {
  location: number;
};

export type LocationsQueryFilters = {
  location: number;
};

export const FilterParams: Isomorphism<
  LocationFilter,
  LocationFilterQueryParams
> = {
  to: k => ({
    location: Number(k.location),
  }),
  from: s => ({
    ...FilterQueryParamDefaults,
    location: s.location.toString(),
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};
