import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";
import { LoginPage } from ".";

export const LoginPageRouteLoader = asyncComponent({
  resolve: async () => {
    const LoginPageRoute: React.FunctionComponent<
      RouteComponentProps<{}>
    > = props => <LoginPage />;
    return LoginPageRoute;
  },
  name: "Login Component",
});
