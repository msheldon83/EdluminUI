import { useQueryBundle } from "graphql/hooks";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";

export function useIsSystemAdminOrAdminInMultipleOrgs() {
  const orgUserQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });
  if (
    orgUserQuery.state !== "LOADING" &&
    orgUserQuery.data.userAccess &&
    orgUserQuery.data.userAccess.me &&
    orgUserQuery.data.userAccess.me.user &&
    orgUserQuery.data.userAccess.me.user.orgUsers
  ) {
    const { isSystemAdministrator } = orgUserQuery.data.userAccess.me;
    const { orgUsers } = orgUserQuery.data.userAccess.me.user;

    const isAdminInOrgs = orgUsers.filter(r => r && r.isAdmin);
    const possibleOrgs = isAdminInOrgs.map(r => r && r.organization);
    return isSystemAdministrator || possibleOrgs.length > 1;
  } else {
    return null;
  }
}
