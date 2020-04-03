import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: PeopleFilters = {
  name: "",
  firstNameSort: "asc",
  lastNameSort: "asc",
  roleFilter: "",
  active: "true",
  endorsements: "",
  positionTypes: "",
  locations: "",
  shadowOrgIds: "",
};

export type FilterRole =
  | OrgUserRole.Employee
  | OrgUserRole.ReplacementEmployee
  | OrgUserRole.Administrator;

export type PeopleFilters = {
  name: string;
  firstNameSort: string;
  lastNameSort: string;
  active: string;
  roleFilter: string;
  endorsements: string;
  positionTypes: string;
  locations: string;
  shadowOrgIds: string;
};

type PeopleFilterQueryParams = Omit<
  PeopleFilters,
  | "active"
  | "roleFilter"
  | "endorsements"
  | "positionTypes"
  | "locations"
  | "shadowOrgIds"
> & {
  active: boolean | undefined;
} & RoleSpecificFilters;

export type RoleSpecificFilters =
  | { roleFilter: null }
  | ReplacementEmployeeQueryFilters
  | EmployeeQueryFilters
  | AdminQueryFilters;

export type ReplacementEmployeeQueryFilters = {
  roleFilter: OrgUserRole.ReplacementEmployee;
  endorsements: string[];
  shadowOrgIds: string[];
};

export type EmployeeQueryFilters = {
  roleFilter: OrgUserRole.Employee;
  positionTypes: string[];
  locations: string[];
};

export type AdminQueryFilters = {
  roleFilter: OrgUserRole.Administrator;
  shadowOrgIds: string[];
  positionTypes: string[];
  locations: string[];
};

export const FilterParams: Isomorphism<
  PeopleFilters,
  PeopleFilterQueryParams
> = {
  to: k => ({
    name: k.name,
    firstNameSort: k.firstNameSort,
    lastNameSort: k.lastNameSort,
    active: stringToBool(k.active),
    ...to(k),
  }),
  from: s => ({
    ...FilterQueryParamDefaults,
    ...from(s),
    name: s.name,
    firstNameSort: s.firstNameSort,
    lastNameSort: s.lastNameSort,
    active: boolToString(s.active),
  }),
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
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

const to = (o: PeopleFilters): RoleSpecificFilters => {
  switch (o.roleFilter) {
    case OrgUserRole.Employee:
      return {
        roleFilter: o.roleFilter,
        positionTypes: o.positionTypes === "" ? [] : o.positionTypes.split(","),
        locations: o.locations === "" ? [] : o.locations.split(","),
      };
    case OrgUserRole.Administrator:
      return {
        roleFilter: o.roleFilter,
        positionTypes: o.positionTypes === "" ? [] : o.positionTypes.split(","),
        locations: o.locations === "" ? [] : o.locations.split(","),
        shadowOrgIds: o.shadowOrgIds === "" ? [] : o.shadowOrgIds.split(","),
      };
    case OrgUserRole.ReplacementEmployee:
      return {
        roleFilter: OrgUserRole.ReplacementEmployee,
        endorsements: o.endorsements === "" ? [] : o.endorsements.split(","),
        shadowOrgIds: o.shadowOrgIds === "" ? [] : o.shadowOrgIds.split(","),
      };
    case "":
    default:
      return { roleFilter: null };
  }
};

const from = (o: RoleSpecificFilters) => {
  switch (o.roleFilter) {
    case OrgUserRole.Administrator:
      return {
        roleFilter: o.roleFilter,
        positionTypes: o.positionTypes.join(","),
        locations: o.locations.join(","),
        shadowOrgIds: o.shadowOrgIds.join(","),
      };
    case OrgUserRole.Employee:
      return {
        roleFilter: o.roleFilter,
        positionTypes: o.positionTypes.join(","),
        locations: o.locations.join(","),
      };
    case OrgUserRole.ReplacementEmployee:
      return {
        roleFilter: OrgUserRole.ReplacementEmployee,
        endorsements: o.endorsements.join(","),
        shadowOrgIds: o.shadowOrgIds.join(","),
      };
    case null:
    default:
      return { roleFilter: "" };
  }
};
