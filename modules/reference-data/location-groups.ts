import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetLocationGroups } from "./get-location-groups.gen";
import { useMemo } from "react";

export function useLocationGroups(orgId?: string | null) {
  const locationGroups = useQueryBundle(GetLocationGroups, {
    fetchPolicy: "cache-first",
    variables: { orgId },
    skip: !orgId,
  });
  return useMemo(() => {
    if (locationGroups.state === "DONE" && locationGroups.data.locationGroup) {
      return compact(locationGroups.data.locationGroup.all) ?? [];
    }
    return [];
  }, [locationGroups]);
}

export function useLocationGroupOptions(orgId?: string | null) {
  const locationGroups = useLocationGroups(orgId);

  return useMemo(
    () => locationGroups.map(lg => ({ label: lg.name, value: lg.id })),
    [locationGroups]
  );
}
