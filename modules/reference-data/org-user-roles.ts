import { OrgUserRole } from "graphql/server-types.gen";

export const OrgUserRoles: {
  enumValue: OrgUserRole;
  name: string;
}[] = [
  {
    enumValue: OrgUserRole.Invalid,
    name: "None",
  },
  {
    enumValue: OrgUserRole.Administrator,
    name: "Admin",
  },
  {
    enumValue: OrgUserRole.Employee,
    name: "Employee",
  },
  {
    enumValue: OrgUserRole.ReplacementEmployee,
    name: "Substitute",
  },
  {
    enumValue: OrgUserRole.AdminOrEmployee,
    name: "Admin or Employee",
  },
  {
    enumValue: OrgUserRole.AdminOrReplacement,
    name: "Admin or Substitute",
  },
];
