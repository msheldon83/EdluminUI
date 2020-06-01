import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAllOrgUsersForRole } from "./org-users-get.gen";
import { useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";

export function useOrgUsers(orgId: string, role: OrgUserRole) {
  const orgUsers = useQueryBundle(GetAllOrgUsersForRole, {
    fetchPolicy: "cache-first",
    variables: { orgId, role: [role] },
  });

  return useMemo(() => {
    if (orgUsers.state === "DONE" && orgUsers.data.orgUser) {
      return compact(orgUsers.data.orgUser.all) ?? [];
    }
    return [];
  }, [orgUsers]);
}

export function useOrgUserOptions(orgId: string, role: OrgUserRole) {
  const orgUsers = useOrgUsers(orgId, role);

  return useMemo(
    () =>
      orgUsers.map(ou => ({
        label: `${ou.firstName} ${ou.lastName}`,
        value: ou.id,
      })),
    [orgUsers]
  );
}
