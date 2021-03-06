import { GetMyUserAccess } from "./get-my-user-access.gen";
import { useQueryBundle } from "graphql/hooks";
import { UserAccess } from "graphql/server-types.gen";
import { compact, uniq } from "lodash-es";
import { OrgUserPermissions } from "ui/components/auth/types";

type MyUserAccess = {
  me: UserAccess | null | undefined;
  permissionsByOrg: OrgUserPermissions[];
  isSysAdmin: boolean;
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
              uniq(
                compact([
                  ...(ou.administrator?.permissions ?? []),
                  ...(ou.employee?.permissions ?? []),
                  ...(ou.substitute?.permissions ?? []),
                ])
              ) ?? [],
            permissionsByRole: [
              {
                role: "admin",
                permissions: compact(ou.administrator?.permissions ?? []),
              },
              {
                role: "employee",
                permissions: compact(ou.employee?.permissions ?? []),
              },
              {
                role: "substitute",
                permissions: compact(ou.substitute?.permissions ?? []),
              },
            ],
          }
        : null
    )
  );

  return {
    me: userAccessQuery.data.userAccess?.me,
    permissionsByOrg,
    isSysAdmin:
      userAccessQuery.data.userAccess?.me?.isSystemAdministrator ?? false,
  };
};
