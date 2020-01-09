import { GetMyUserAccess } from "./get-my-user-access.gen";
import { useQueryBundle } from "graphql/hooks";
import { some } from "lodash-es";

export const useIsAdmin = () => {
  const orgUserQuery = useQueryBundle(GetMyUserAccess, {
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
