import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { RouteProps, Route, RouteComponentProps } from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import { AdminChromeRoute } from "ui/routes/app-chrome";

// Copied from https://stackoverflow.com/a/52366872 and tweaked

interface AdminOrgRouteProps extends RouteProps {
  component?:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
}
type RenderComponent = (props: RouteComponentProps<any>) => React.ReactNode;

export const AdminOrgRoute: React.FC<AdminOrgRouteProps> = props => {
  const { component: Component, ...rest } = props;
  const params = useRouteParams(AdminChromeRoute);

  //const params = useRouteParams(AdminChromeRoute);
  const userAccess = useMyUserAccess();
  if (!userAccess) {
    return <></>;
  }

  // Check that the User is an Admin in the current Org
  const orgUsers = userAccess.user?.orgUsers ?? [];
  const matchingOrgUser = orgUsers.find(
    ou => ou?.orgId === Number(params.organizationId)
  );
  const hasAccess =
    userAccess.isSystemAdministrator || !!matchingOrgUser?.isAdmin;

  // TODO: If they don't have Admin access to this Org, redirect them to the No Access page
  if (!hasAccess) {
    return <></>;
  }

  if (!Component) {
    return <Route {...rest}>{props.children}</Route>;
  }

  const renderComponent: RenderComponent = props => <Component {...props} />;
  return <Route {...rest} render={renderComponent} />;
};
