import * as React from "react";
import { RouteComponentProps } from "react-router-dom";
import { asyncComponent } from "ui/async-component";

export const LoginPageRouteLoader = asyncComponent({
  resolve: async () => {
    const LoginPage = (await import("ui/pages/login")).LoginPage;
    const LoginPageRoute: React.FunctionComponent<RouteComponentProps<{}>> = props => (
      <LoginPage />
    );
    return LoginPageRoute;
  },
  name: "Login Component",
});
