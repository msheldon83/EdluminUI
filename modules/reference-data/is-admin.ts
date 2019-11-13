import { QueryOrgUserRoles } from "ui/app-chrome/role-switcher/QueryOrgUserRoles.gen";
import { useQueryBundle } from "graphql/hooks";
import { some } from "lodash-es";

export const useIsAdmin = () => {
  const orgUserQuery = useQueryBundle(QueryOrgUserRoles, {
    fetchPolicy: "cache-first",
  });

  if (orgUserQuery.state !== "DONE") {
    return null;
  }
  return (
    orgUserQuery.data.userAccess?.me?.isSystemAdministrator ||
    some(orgUserQuery.data.userAccess?.me?.user?.orgUsers ?? [], "isAdmin")
  );
};
