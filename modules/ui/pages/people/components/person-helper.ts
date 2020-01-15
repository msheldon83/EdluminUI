import { OrgUserRole } from "graphql/server-types.gen";

export type OrgUser = {
  orgId: number;
  name: string;
  externalId?: string | null;
  role: OrgUserRole | null;
  permissionSet?: number;
};
