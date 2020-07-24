import { useQueryBundle } from "graphql/hooks";
import { GetCannyToken } from "./graphql/get-canny-token.gen";
import { useMemo } from "react";

export function getCannyToken() {
  const getToken = useQueryBundle(GetCannyToken, {
    fetchPolicy: "network-only",
  });

  return useMemo(() => {
    if (getToken.state === "DONE") {
      // && getToken?.data?.user?.cannyToken) {
      console.log("state is done");
      return getToken?.data?.user?.cannyToken;
    }
    return null;
  }, [getToken]);
}
