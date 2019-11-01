import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: PeopleFilters = {
  name: "",
  firstNameSort: "desc",
  lastNameSort: "",
  roleFilter: "",
  active: "",
  endorsements: "",
};

export type FilterRole =
  | OrgUserRole.Employee
  | OrgUserRole.ReplacementEmployee
  | OrgUserRole.Administrator;

type PeopleFilters = {
  name: string;
  firstNameSort: string;
  lastNameSort: string;
  active: string;
  roleFilter: string;
  endorsements: string;
};

type RoleSpecificFilters =
  | { roleFilter: null }
  | { roleFilter: OrgUserRole.ReplacementEmployee; endorsements: string[] }
  | { roleFilter: OrgUserRole.Employee }
  | { roleFilter: OrgUserRole.Administrator };

type PeopleFilterQueryParams = Omit<
  PeopleFilters,
  "active" | "roleFilter" | "endorsements"
> & {
  active: boolean | undefined;
} & RoleSpecificFilters;

type ReplacementEmployeeQueryFilters = {
  endorsements: string[];
};

type EmployeeFilters = {
  positionTypes: string;
  location: string;
};

type AdminFilters = {
  managesPositionTypes: string;
  managesLocation: string;
};

const FilterParams: Isomorphism<PeopleFilters, PeopleFilterQueryParams> = {
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
  console.log("to?", o);
  switch (o.roleFilter) {
    case OrgUserRole.Administrator:
      return { roleFilter: OrgUserRole.Administrator };
    case OrgUserRole.Employee:
      return { roleFilter: OrgUserRole.Employee };
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
  console.log("from?", o);
  switch (o.roleFilter) {
    case OrgUserRole.Administrator:
      return { roleFilter: OrgUserRole.Administrator };
    case OrgUserRole.Employee:
      return { roleFilter: OrgUserRole.Employee };
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

const strToOrgUserRoleOrNull = (r: string): OrgUserRole | null => {
  switch (r) {
    case OrgUserRole.Administrator:
      return OrgUserRole.Administrator;
    case OrgUserRole.Employee:
      return OrgUserRole.Employee;
    case OrgUserRole.ReplacementEmployee:
      return OrgUserRole.ReplacementEmployee;
    case "":
    default:
      return null;
  }
};
const orgUserRoleOrNullToStr = (r: OrgUserRole | null): string => {
  switch (r) {
    case OrgUserRole.Administrator:
      return OrgUserRole.Administrator;
    case OrgUserRole.Employee:
      return OrgUserRole.Employee;
    case OrgUserRole.ReplacementEmployee:
      return OrgUserRole.ReplacementEmployee;
    case null:
    default:
      return "";
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
