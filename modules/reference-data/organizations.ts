import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetOrganizations } from "./get-organizations.gen";
import { useMemo } from "react";

export function useOrganizations() {
  const organizations = useQueryBundle(GetOrganizations, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (organizations.state === "DONE" && organizations.data.organization) {
      return compact(organizations.data.organization.all) ?? [];
    }
    return [];
  }, [organizations]);
}
