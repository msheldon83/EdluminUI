import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAllApproverGroups } from "./get-approver-groups.gen";
import { useMemo } from "react";

export function useApproverGroups(orgId: string) {
  const approverGroups = useQueryBundle(GetAllApproverGroups, {
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

export function useApproverGroupOptions(orgId: string, idsToRemove?: string[]) {
  const approverGroups = useApproverGroups(orgId);

  return useMemo(() => {
    const groups = idsToRemove
      ? approverGroups.filter(g => !idsToRemove.includes(g.id))
      : approverGroups;
    return groups.map(g => ({
      label: g.name,
      value: g.id,
    }));
  }, [approverGroups, idsToRemove]);
}
