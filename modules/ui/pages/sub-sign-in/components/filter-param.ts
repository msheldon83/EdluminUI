import { Isomorphism } from "@atomic-object/lenses";
import { startOfToday, format } from "date-fns";

export const FilterQueryParamDefaults: SubSignInFilter = {
  location: "",
  date: format(startOfToday(), "P"),
};

export type SubSignInFilter = {
  location: string;
  date: string;
};

type SubSignInFilterQueryParams = {
  location: number;
  date: string;
};

export type SubSignInQueryFilters = {
  location: number;
  date: string;
};

export const FilterParams: Isomorphism<
  SubSignInFilter,
  SubSignInFilterQueryParams
> = {
  to: k => ({
    date: k.date,
    location: Number(k.location),
  }),
  from: s => ({
    ...FilterQueryParamDefaults,
    location: s.location.toString(),
    date: s.date,
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};
