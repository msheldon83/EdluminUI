import * as React from "react";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useHistory } from "react-router";
import { useApolloClient } from "@apollo/react-hooks";

type Props = {};

export const EndImpersonate: React.FC<Props> = props => {
  const isImpersonating = useIsImpersonating();
  const history = useHistory();
  const client = useApolloClient();

  if (isImpersonating) {
    sessionStorage.removeItem(Config.impersonation.actingUserIdKey);
    sessionStorage.removeItem(Config.impersonation.actingOrgUserIdKey);

    // To prevent issues with cached data from the current impersonated user
    // prior to ending impersonation, let's clear out the Apollo cache
    client.clearStore().then(
      () => {},
      () => {}
    );
  }

  history.push("/");

  return <></>;
};
