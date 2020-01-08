import { OrgUserRole } from "graphql/server-types.gen";

export const OrgUserRoles: {
  enumValue: OrgUserRole;
  name: string;
}[] = [
  {
    enumValue: "INVALID" as OrgUserRole,
    name: "None",
  },
  {
    enumValue: "ADMINISTRATOR" as OrgUserRole,
    name: "Admin",
  },
  {
    enumValue: "EMPLOYEE" as OrgUserRole,
    name: "Employee",
  },
  {
    enumValue: "REPLACEMENT_EMPLOYEE" as OrgUserRole,
    name: "Substitute",
  },
  {
    enumValue: "ADMIN_OR_EMPLOYEE" as OrgUserRole,
    name: "Admin or Employee",
  },
  {
    enumValue: "ADMIN_OR_REPLACEMENT" as OrgUserRole,
    name: "Admin or Substitute",
  },
];
