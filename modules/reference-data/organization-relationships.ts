import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetOrganizationRelationships } from "./get-organization-relationships.gen";
import { useMemo } from "react";

export function useOrganizationRelationships(orgId?: string | null) {
  const organizationRelationships = useQueryBundle(
    GetOrganizationRelationships,
    {
      fetchPolicy: "cache-first",
      variables: {
        orgId,
      },
      skip: !orgId,
    }
  );

  return useMemo(() => {
    if (
      organizationRelationships.state === "DONE" &&
      organizationRelationships.data.organizationRelationship
    ) {
      return (
        compact(organizationRelationships.data.organizationRelationship.all) ??
        []
      );
    }
    return [];
  }, [organizationRelationships]);
}
