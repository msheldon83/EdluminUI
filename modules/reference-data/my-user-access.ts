import { GetMyUserAccess } from "./get-my-user-access.gen";
import { useQueryBundle } from "graphql/hooks";
import { UserAccess, PermissionEnum } from "graphql/server-types.gen";
import { useMemo } from "react";
import { compact } from "lodash-es";

type MyUserAccess = {
  me: UserAccess | null | undefined;
  permissionsByOrg: OrgUserPermissions[];
};

type OrgUserPermissions = {
  orgId: string;
  permissions: PermissionEnum[];
};

export const useMyUserAccess = (): MyUserAccess | null => {
  const userAccessQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  if (userAccessQuery.state !== "DONE") {
    return null;
  }

  const userAccess = userAccessQuery.data.userAccess?.me;
  // Condense the permissions into a single list by OrgId
  const permissionsByOrg: OrgUserPermissions[] = compact(
    userAccess?.user?.orgUsers?.map(ou =>
      ou
        ? {
            orgId: ou.orgId.toString(),
            permissions:
              compact([
                ...(ou.administrator?.permissions ?? []),
                ...(ou.employee?.permissions ?? []),
                ...(ou.substitute?.permissions ?? []),
              ]) ?? [],
          }
        : null
    )
  );

  // TODO: make sure we have a list of unique permissions
  return {
    me: userAccessQuery.data.userAccess?.me,
    permissionsByOrg,
  };
};
