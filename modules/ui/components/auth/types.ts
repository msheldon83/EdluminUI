import { PermissionEnum } from "graphql/server-types.gen";

export type OrgUserPermissions = {
  orgId: string;
  permissions: PermissionEnum[];
};

export type CanDo =
  | PermissionEnum[]
  | ((
      permissions: OrgUserPermissions[],
      isSysAdmin: boolean,
      orgId?: string | undefined
    ) => boolean);
