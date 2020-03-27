import * as React from "react";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useHistory } from "react-router";

type Props = {};

export const EndImpersonate: React.FC<Props> = props => {
  const isImpersonating = useIsImpersonating();
  const history = useHistory();
  console.log("here");
  if (isImpersonating) {
    sessionStorage.removeItem(Config.impersonation.actingUserIdKey);
    sessionStorage.removeItem(Config.impersonation.actingOrgUserIdKey);
  }

  history.push("/");

  return <></>;
};
