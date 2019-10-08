import { Button } from "@material-ui/core";
import { useAuth0 } from "auth/auth0";
import * as React from "react";

export const LoginPage: React.FunctionComponent<{}> = props => {
  const auth0 = useAuth0();
  return (
    <div>
      <Button onClick={auth0.login} variant="contained">
        Login
      </Button>
    </div>
  );
};
