import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetOrgUserRelationships } from "./get-org-user-org-relationships.gen";
import { useMemo } from "react";

export function useOrgUserOrgRelationships(
  userId: string,
  staffingOrgId: string
) {
  const organizationRelationships = useQueryBundle(GetOrgUserRelationships, {
    fetchPolicy: "cache-first",
    variables: {
      staffingOrgId: staffingOrgId,
      userId: userId,
    },
  });

  return useMemo(() => {
    if (
      organizationRelationships.state === "DONE" &&
      organizationRelationships.data.organizationRelationship
    ) {
      return (
        compact(
          organizationRelationships.data.organizationRelationship
            .orgUserOrganizationRelationships
        ) ?? []
      );
    }
    return [];
  }, [organizationRelationships]);
}
