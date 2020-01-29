import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: PeopleFilters = {
  name: "",
  firstNameSort: "asc",
  lastNameSort: "asc",
  roleFilter: "",
  active: "",
  endorsements: "",
  positionTypes: "",
  locations: "",
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
  | PositionTypesAndLocationsQueryFilters;

export type ReplacementEmployeeQueryFilters = {
  roleFilter: OrgUserRole.ReplacementEmployee;
  endorsements: string[];
};

export type PositionTypesAndLocationsQueryFilters = {
  roleFilter: OrgUserRole.Employee | OrgUserRole.Administrator;
  positionTypes: string[];
  locations: string[];
};

// export type AdminQueryFilters = {
//   roleFilter: OrgUserRole.Administrator;
//   managesPositionTypes: number[];
//   managesLocations: number[];
// };

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
    case OrgUserRole.Administrator:
      return {
        roleFilter: o.roleFilter,
        positionTypes: o.positionTypes.split(","),
        locations: o.locations.split(","),
      };
    case OrgUserRole.ReplacementEmployee:
      return {
        roleFilter: OrgUserRole.ReplacementEmployee,
        endorsements: o.endorsements.split(","),
      };
    case "":
    default:
      return { roleFilter: null };
  }
};

const from = (o: RoleSpecificFilters) => {
  switch (o.roleFilter) {
    case OrgUserRole.Administrator:
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
