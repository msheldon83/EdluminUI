import * as React from "react";
import { useAuth0 } from "auth/auth0";

export const IfAuthenticated: React.FC<{ not?: boolean }> = props => {
  const auth = useAuth0();
  if (auth.isAuthenticated === !props.not) {
    return <>{props.children}</>;
  }
  return <></>;
};
