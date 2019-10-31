import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: PeopleFilters = {
  // name: "",
  firstName: "desc",
  lastName: "",
  roleFilter: "",
  active: "",
};

export type FilterRole =
  | OrgUserRole.Employee
  | OrgUserRole.ReplacementEmployee
  | OrgUserRole.Administrator;

type PeopleFilters = {
  // name: string | "";
  firstName: string;
  lastName: string;
  active: string;
  roleFilter: string;
};

type PeopleFilterQueryParams = Omit<PeopleFilters, "active" | "roleFilter"> & {
  active: boolean | undefined;
  roleFilter: OrgUserRole | null;
};

const FilterParams: Isomorphism<PeopleFilters, PeopleFilterQueryParams> = {
  to: k => ({
    firstName: k.firstName,
    lastName: k.lastName,
    roleFilter: strToOrgUserRoleOrNull(k.roleFilter),
    active: stringToBool(k.active),
  }),
  from: s => ({
    firstName: s.firstName,
    lastName: s.lastName,
    roleFilter: orgUserRoleOrNullToStr(s.roleFilter),
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

// Keeping around for reference
type EmptyStringToNull<T, K extends keyof T> = Omit<T, K> &
  {
    [P in K]: Exclude<T[P], ""> | null;
  };
type Whatever2 = EmptyStringToNull<PeopleFilters, "active" | "roleFilter">;
type Whatever = Omit<PeopleFilters, "firstName" | "lastName" | "active"> &
  {
    [P in "lastName" | "lastName" | "active"]: Exclude<
      PeopleFilters[P],
      ""
    > | null;
  };
