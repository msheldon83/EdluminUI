import { useQueryBundle } from "graphql/hooks";
import { GetEndorsements } from "./get-endorsements.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";

export function useEndorsements(
  orgId: string,
  includeExpired = false,
  searchText: string | undefined = undefined
) {
  const endorsements = useQueryBundle(GetEndorsements, {
    fetchPolicy: "cache-first",
    variables: { orgId, includeExpired, searchText },
  });

  return useMemo(() => {
    if (endorsements.state === "DONE" && endorsements.data.orgRef_Endorsement) {
      return compact(endorsements.data.orgRef_Endorsement.all) ?? [];
    }
    return [];
  }, [endorsements]);
}

export function useEndorsementOptions(orgId: string) {
  const endorsements = useEndorsements(orgId);

  return useMemo(
    () =>
      endorsements.map(e => ({
        label: e.name,
        value: e.id,
      })),
    [endorsements]
  );
}
