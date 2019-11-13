import { useQueryBundle } from "graphql/hooks";
import { GetEndorsements } from "./get-endorsements.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";

export function useEndorsements(orgId: string) {
  const endorsements = useQueryBundle(GetEndorsements, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (endorsements.state === "DONE" && endorsements.data.orgRef_Endorsement) {
      return compact(endorsements.data.orgRef_Endorsement.all) ?? [];
    }
    return [];
  }, [endorsements]);
}
