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
  location: string;
  date: string;
};

export type SubSignInQueryFilters = {
  location: string;
  date: string;
};

export const FilterParams: Isomorphism<
  SubSignInFilter,
  SubSignInFilterQueryParams
> = {
  to: k => ({
    date: k.date,
    location: k.location,
  }),
  from: s => ({
    ...FilterQueryParamDefaults,
    location: s.location,
    date: s.date,
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};
