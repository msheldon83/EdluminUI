import { PermissionEnum, OrgUserRole } from "graphql/server-types.gen";

export type OrgUserPermissions = {
  orgId: string;
  permissions: PermissionEnum[];
  permissionsByRole: RolePermissions[];
};

export type RolePermissions = {
  role: Role;
  permissions: PermissionEnum[];
};

export type Role = "admin" | "employee" | "substitute";

export type CanDo =
  | PermissionEnum[]
  | ((
      permissions: OrgUserPermissions[],
      isSysAdmin: boolean,
      orgId?: string | undefined,
      context?: any
    ) => boolean);
