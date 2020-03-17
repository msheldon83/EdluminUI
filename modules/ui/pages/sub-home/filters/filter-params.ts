import { Isomorphism } from "@atomic-object/lenses";

export const FilterQueryParamDefaults: SubHomeFilters = {
  orgIds: "",
  positionTypeIds: "",
  locationIds: "",
  times: "",
  showNonPreferredJobs: "false",
};

export type SubHomeFilters = {
  orgIds: string;
  positionTypeIds: string;
  locationIds: string;
  times: string;
  showNonPreferredJobs: string;
};

type SubHomeFilterQueryParams = Omit<
  SubHomeFilters,
  | "orgIds"
  | "positionTypeIds"
  | "locationIds"
  | "times"
  | "showNonPreferredJobs"
> & {
  showNonPreferredJobs: boolean | undefined;
} & SubHomeQueryFilters;

export type SubHomeQueryFilters = {
  orgIds: string[];
  locationIds: string[];
  positionTypeIds: string[];
  times: string[];
  showNonPreferredJobs: boolean | undefined;
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
    showNonPreferredJobs: stringToBool(o.showNonPreferredJobs),
  };
};

const from = (o: SubHomeQueryFilters) => {
  return {
    orgIds: o.orgIds.join(","),
    locationIds: o.locationIds.join(","),
    positionTypeIds: o.positionTypeIds.join(","),
    times: o.times.join(","),
    showNonPreferredJobs: boolToString(o.showNonPreferredJobs),
  };
};

export const stringToBool = (s: string): boolean | undefined => {
  switch (s) {
    case "true":
      return true;
    case "false":
      return false;
    case "":
    default:
      return undefined;
  }
};
const boolToString = (b: boolean | undefined): "true" | "false" | "" => {
  switch (b) {
    case true:
      return "true";
    case false:
      return "false";
    case undefined:
      return "";
  }
};
