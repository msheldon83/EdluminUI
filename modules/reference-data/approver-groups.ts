import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetApproverGroups } from "./get-approver-groups.gen";
import { useMemo } from "react";

export function useApproverGroups(orgId: string) {
  const approverGroups = useQueryBundle(GetApproverGroups, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (approverGroups.state === "DONE" && approverGroups.data.approverGroup) {
      return compact(approverGroups.data.approverGroup.all) ?? [];
    }
    return [];
  }, [approverGroups]);
}
