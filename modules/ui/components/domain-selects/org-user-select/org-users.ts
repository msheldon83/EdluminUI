import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAllOrgUsersForRole } from "./org-users-get.gen";
import { useMemo } from "react";
import { OrgUserRole } from "graphql/server-types.gen";
import { fullNameSort } from "helpers/full-name-sort";

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
      orgUsers
        .sort((ou1, ou2) => fullNameSort(ou1, ou2))
        .map(ou => ({
          label: `${ou.lastName}, ${ou.firstName}`,
          value: ou.id,
        })),
    [orgUsers]
  );
}
