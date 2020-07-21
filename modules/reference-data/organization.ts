import { useQueryBundle } from "graphql/hooks";
import { GetOrganization } from "./get-organization.gen";
import { useMemo } from "react";

export function useOrganization(orgId: string) {
  const organization = useQueryBundle(GetOrganization, {
    fetchPolicy: "cache-first",
    variables: {
      orgId,
    },
  });

  return useMemo(() => {
    if (organization.state === "DONE" && organization.data.organization) {
      return organization.data.organization.byId;
    }
    return;
  }, [organization]);
}
