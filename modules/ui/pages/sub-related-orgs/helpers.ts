import { Maybe } from "graphql/server-types.gen";

export type CustomOrgUserRelationship = {
  otherOrganization: Maybe<{
    orgId: string;
    name: string;
  }> | null;
  attributes: {
    endorsementId: string;
    expirationDate?: Date | null;
    name?: string;
  }[];
};
