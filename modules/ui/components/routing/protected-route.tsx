import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import {
  RouteProps,
  Route,
  RouteComponentProps,
  Redirect,
} from "react-router-dom";
import { useRouteParams } from "ui/routes/definition";
import { AdminChromeRoute, AppChromeRoute } from "ui/routes/app-chrome";
import {
  UnauthorizedRoute,
  UnauthorizedRoleRoute,
} from "ui/routes/unauthorized";
import { PermissionEnum } from "graphql/server-types.gen";
import { can } from "helpers/permissions";

// Copied from https://stackoverflow.com/a/52366872 and tweaked

interface AdminOrgRouteProps extends RouteProps {
  component?:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  permissions?: PermissionEnum[];
}
type RenderComponent = (props: RouteComponentProps<any>) => React.ReactNode;

export const ProtectedRoute: React.FC<AdminOrgRouteProps> = props => {
  const { component: Component, ...rest } = props;
  const adminRouteParams = useRouteParams(AdminChromeRoute);
  const adminInOrg = !isNaN(+adminRouteParams.organizationId);
  const roleRouteParams = useRouteParams(AppChromeRoute);

  const userAccess = useMyUserAccess();
  if (!userAccess) {
    return <></>;
  }

  const isSysAdmin = userAccess.me?.isSystemAdministrator ?? false;
  let hasAccessToOrg = true;
  let hasAccessViaPermissions = true;
  // Only do further access checks if the current User is NOT a Sys Admin
  if (!isSysAdmin) {
    // If we have an Org Id available to us, check that first
    if (adminInOrg) {
      const orgUsers = userAccess.me?.user?.orgUsers ?? [];
      const matchingOrgUser = orgUsers.find(
        ou => ou?.orgId === Number(adminRouteParams.organizationId)
      );
      hasAccessToOrg = !!matchingOrgUser?.isAdmin;
    }
    // If we have a list of permissions to check, make sure the User has at least one of them
    if (!hasAccessToOrg) {
      hasAccessViaPermissions = false;
    } else if (props.permissions && props.permissions.length > 0) {
      hasAccessViaPermissions = can(
        props.permissions,
        userAccess.permissionsByOrg,
        isSysAdmin,
        adminRouteParams.organizationId
      );
    }
  }

  if (!hasAccessToOrg) {
    return <Redirect to={UnauthorizedRoute.generate({})} />;
  }
  if (!hasAccessViaPermissions) {
    return <Redirect to={UnauthorizedRoleRoute.generate(roleRouteParams)} />;
  }

  if (!Component) {
    return <Route {...rest}>{props.children}</Route>;
  }

  const renderComponent: RenderComponent = props => <Component {...props} />;
  return <Route {...rest} render={renderComponent} />;
};
