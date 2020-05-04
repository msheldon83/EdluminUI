import {
  Maybe,
  BasicOrganization,
  OrgUserRelationship,
  OrgUserRelationshipAttribute,
} from "graphql/server-types.gen";

export type CustomOrgUserRelationship = {
  id: string;
  otherOrganization?:
    | Maybe<{
        id: string;
        orgId: string;
        name: string;
      }>[]
    | null;
  attributes?:
    | Maybe<{
        expirationDate?: Date | null;
        endorsement: Maybe<{
          id: string;
          name: string;
          validUntil?: Date | null;
        }> | null;
      }>[]
    | null;
};
