import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetPermissionSets } from "./get-permission-sets.gen";
import { useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";

export function usePermissionSets(orgId: string, roles?: Array<OrgUserRole>) {
  const permissionSets = useQueryBundle(GetPermissionSets, {
    fetchPolicy: "cache-first",
    variables: { orgId, roles },
  });

  return useMemo(() => {
    if (permissionSets.state === "DONE" && permissionSets.data.permissionSet) {
      return compact(permissionSets.data.permissionSet.all) ?? [];
    }
    return [];
  }, [permissionSets]);
}
