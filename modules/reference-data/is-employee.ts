import { GetMyUserAccess } from "./get-my-user-access.gen";
import { useQueryBundle } from "graphql/hooks";
import { some } from "lodash-es";

export const useIsEmployee = (orgId?: string) => {
  const orgUserQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  if (orgUserQuery.state !== "DONE") {
    return null;
  }

  return orgId
    ? (orgUserQuery.data.userAccess?.me?.user?.orgUsers ?? []).find(
        (o: any) => o.orgId === orgId
      )?.isEmployee ?? false
    : some(
        orgUserQuery.data.userAccess?.me?.user?.orgUsers ?? [],
        "isEmployee"
      );
};
