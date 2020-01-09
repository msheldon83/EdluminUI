import { GetMyUserAccess } from "./get-my-user-access.gen";
import { useQueryBundle } from "graphql/hooks";

export const useMyUserAccess = () => {
  const userAccessQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  if (userAccessQuery.state !== "DONE") {
    return null;
  }
  return userAccessQuery.data.userAccess?.me;
};
