import { Isomorphism } from "@atomic-object/lenses";

export const FilterQueryParamDefaults: OrgFilters = {
  searchText: "",
};

export type OrgFilters = {
  searchText: string;
};

type PeopleFilterQueryParams = Omit<OrgFilters, "active">;

export const FilterParams: Isomorphism<OrgFilters, PeopleFilterQueryParams> = {
  to: k => ({
    searchText: k.searchText,
  }),
  from: s => ({
    ...FilterQueryParamDefaults,
    searchText: s.searchText,
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};
