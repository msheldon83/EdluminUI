import { Isomorphism } from "@atomic-object/lenses";
import { OrgUserRole } from "graphql/server-types.gen";

export const FilterQueryParamDefaults: PeopleFilters = {
  // name: "",
  firstName: "desc",
  lastName: "",
  roleFilter: "",
  active: true,
  inactive: true,
};

type PeopleFilters = {
  // name: string | "";
  firstName: "asc" | "desc" | "";
  lastName: "asc" | "desc" | "";
  active: boolean;
  inactive: boolean;
} & (
  | { roleFilter: "" }
  | {
      roleFilter: OrgUserRole.Employee;
      // location: { id: number; name: string }[];
      // positionType: string;
    }
  | {
      roleFilter: OrgUserRole.ReplacementEmployee;
      // endorsements: { id: number; name: string }[]
    }
  | {
      roleFilter: OrgUserRole.Administrator;
      // managesLocation: { id: number; name: string }[];
      // managesPositionType: string;
    });

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

type NoEmptyStrings = Omit<PeopleFilters, "active" | "roleFilter"> & {
  active: boolean | null;
  roleFilter: OrgUserRole | null;
};
type FilterRole =
  | OrgUserRole.Employee
  | OrgUserRole.ReplacementEmployee
  | OrgUserRole.Administrator;

const FilterParams: Isomorphism<PeopleFilters, NoEmptyStrings> = {
  to: k => ({
    firstName: k.firstName,
    lastName: k.lastName,
    roleFilter: strToOrgUserRoleOrNull(k.roleFilter),
    active: k.active,
    inactive: k.inactive,
  }),
  from: s => ({
    firstName: s.firstName,
    lastName: s.lastName,
    roleFilter: s.roleFilter, // orgUserRoleOrNullToStr(s.roleFilter),
    active: s.active,
  }),
};

// type ActiveStatus = "true" | "false" | "";
export type ActiveStatus = "active" | "inactive" | "all";
export const statusToBool = (s: ActiveStatus): boolean | undefined => {
  switch (s) {
    case "active":
      return true;
    case "inactive":
      return false;
    default:
      return undefined;
  }
};
const boolToStatus = (b: boolean | null): ActiveStatus => {
  switch (b) {
    case true:
      return "active";
    case false:
      return "inactive";
    case null:
      return "all";
  }
};

const strToOrgUserRoleOrNull = (r: string): OrgUserRole | null => {
  if (r === "") {
    return null;
  } else {
    return r as OrgUserRole;
  }
};
const orgUserRoleOrNullToStr = (r: OrgUserRole | null): FilterRole | "" => {
  if (r === null) {
    return "";
  } else {
    return r as FilterRole;
  }
};

export const FilterQueryParams = {
  defaults: FilterQueryParamDefaults,
  iso: FilterParams,
};
