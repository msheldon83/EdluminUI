import { OrgUserRole } from "graphql/server-types.gen";

export type OrgUser = {
  orgId: string;
  name: string;
  externalId?: string | null;
  role: OrgUserRole | null;
  permissionSet?: string;
};
