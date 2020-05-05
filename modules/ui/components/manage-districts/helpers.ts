import { Maybe } from "graphql/server-types.gen";

export type CustomOrgUserRelationship = {
  id: string;
  otherOrganization?: Maybe<{
    id: string;
    orgId: string;
    name: string;
  }> | null;
  attributes?:
    | Maybe<{
        endorsementId: string;
        expirationDate?: Date | null;
        endorsement: Maybe<{
          id: string;
          name: string;
          validUntil?: Date | null;
        }> | null;
      }>[]
    | null;
};

export type CustomEndorsement = {
  orgId: string;
  attributeId: string;
  expirationDate?: Date | null;
};
