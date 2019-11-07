import { useQueryBundle } from "graphql/hooks";
import { GetOrgConfigFeatureFlags } from "./get-org-config-feature-flags.gen";
import { compact } from "lodash-es";

export function useOrgFeatureFlags(orgId: string) {
  const getFeatureFlags = useQueryBundle(GetOrgConfigFeatureFlags, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  if (getFeatureFlags.state === "DONE" && getFeatureFlags.data.organization?.byId?.config?.featureFlags) {
    return compact(getFeatureFlags.data.organization?.byId.config.featureFlags) ?? [];
  }
  return [];
}