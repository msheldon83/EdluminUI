import * as React from "react";
import { useIsImpersonating } from "reference-data/is-impersonating";

type Props = {};

export const EndImpersonate: React.FC<Props> = props => {
  const isImpersonating = useIsImpersonating();

  if (isImpersonating) {
    sessionStorage.removeItem(Config.impersonation.actingUserIdKey);
    sessionStorage.removeItem(Config.impersonation.actingOrgUserIdKey);
  }

  // To prevent issues with cached data from the impersonated user
  // we can use window.location.href to redirect, which is the
  // same as a hard refresh, and empties the cache
  window.location.href = "/";

  return <></>;
};
