import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetLocations } from "./get-locations.gen";

export function useLocations(orgId: string) {
  const locations = useQueryBundle(GetLocations, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });
  if (locations.state === "DONE" && locations.data.location) {
    return compact(locations.data.location.all) ?? [];
  }
  return [];
}
