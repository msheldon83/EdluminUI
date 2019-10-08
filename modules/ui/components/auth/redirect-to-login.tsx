import * as React from "react";
import { useAuth0 } from "auth/auth0";
import { useEffect } from "react";

export const RedirectToLogin: React.FC<{}> = () => {
  const auth = useAuth0();
  useEffect(() => {
    auth.login();
  });
  return <></>;
};
