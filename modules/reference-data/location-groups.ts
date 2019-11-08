import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetLocationGroups } from "./get-location-groups.gen";

export function useLocationGroups(orgId: string) {
  const locationGroups = useQueryBundle(GetLocationGroups, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });
  if (locationGroups.state === "DONE" && locationGroups.data.locationGroup) {
    return compact(locationGroups.data.locationGroup.all) ?? [];
  }
  return [];
}
