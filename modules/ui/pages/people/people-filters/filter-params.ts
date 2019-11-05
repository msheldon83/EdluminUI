import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: PeopleFilters = {
  name: "",
  firstNameSort: "desc",
  lastNameSort: "",
  roleFilter: "",
  active: "",
  endorsements: "",
  positionTypes: "",
  locations: "",
  managesPositionTypes: "",
  managesLocations: "",
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
  managesPositionTypes: string;
  managesLocations: string;
};

type PeopleFilterQueryParams = Omit<
  PeopleFilters,
  | "active"
  | "roleFilter"
  | "endorsements"
  | "positionTypes"
  | "locations"
  | "managesPositionTypes"
  | "managesLocations"
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
  endorsements: number[];
};

export type EmployeeQueryFilters = {
  roleFilter: OrgUserRole.Employee;
  positionTypes: number[];
  locations: number[];
};

export type AdminQueryFilters = {
  roleFilter: OrgUserRole.Administrator;
  managesPositionTypes: number[];
  managesLocations: number[];
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
    case OrgUserRole.Administrator:
      return {
        roleFilter: OrgUserRole.Administrator,
        managesPositionTypes: stringToNumberArray(o.managesPositionTypes),
        managesLocations: stringToNumberArray(o.managesLocations),
      };
    case OrgUserRole.Employee:
      return {
        roleFilter: OrgUserRole.Employee,
        positionTypes: stringToNumberArray(o.positionTypes),
        locations: stringToNumberArray(o.locations),
      };
    case OrgUserRole.ReplacementEmployee:
      return {
        roleFilter: OrgUserRole.ReplacementEmployee,
        endorsements: stringToNumberArray(o.endorsements),
      };
    case "":
    default:
      return { roleFilter: null };
  }
};

const stringToNumberArray = (s: string): number[] => {
  return s === "" ? [] : s.split(",").map(e => Number(e));
};

const from = (o: RoleSpecificFilters) => {
  switch (o.roleFilter) {
    case OrgUserRole.Administrator:
      return {
        roleFilter: OrgUserRole.Administrator,
        managesPositionTypes: o.managesPositionTypes.join(","),
        managesLocations: o.managesLocations.join(","),
      };
    case OrgUserRole.Employee:
      return {
        roleFilter: OrgUserRole.Employee,
        positionTypes: o.positionTypes.join(","),
        locations: o.locations.join(","),
      };
    case OrgUserRole.ReplacementEmployee:
      return {
        roleFilter: OrgUserRole.ReplacementEmployee,
        endorsements: o.endorsements.join(","),
      };
    case null:
    default:
      return { roleFilter: "" };
  }
};

// // Keeping around for reference
// type EmptyStringToNull<T, K extends keyof T> = Omit<T, K> &
//   {
//     [P in K]: Exclude<T[P], ""> | null;
//   };
// type Whatever2 = EmptyStringToNull<PeopleFilters, "active" | "roleFilter">;
// type Whatever = Omit<PeopleFilters, "firstName" | "lastName" | "active"> &
//   {
//     [P in "lastName" | "lastName" | "active"]: Exclude<
//       PeopleFilters[P],
//       ""
//     > | null;
//   };
