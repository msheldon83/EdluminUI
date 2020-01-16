import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import {
  RouteProps,
  Route,
  RouteComponentProps,
  Redirect,
} from "react-router-dom";
import {
  UnauthorizedRoute,
  UnauthorizedAdminRoleRoute,
  UnauthorizedEmployeeRoleRoute,
  UnauthorizedSubstituteRoleRoute,
} from "ui/routes/unauthorized";
import { PermissionEnum } from "graphql/server-types.gen";
import { can } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";

// Copied from https://stackoverflow.com/a/52366872 and tweaked

interface ProtectedRouteProps extends RouteProps {
  role: "employee" | "substitute" | "admin";
  component?:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  permissions?: PermissionEnum[];
}
type RenderComponent = (props: RouteComponentProps<any>) => React.ReactNode;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = props => {
  const { component: Component, ...rest } = props;
  const organizationId = useOrganizationId();

  const userAccess = useMyUserAccess();
  if (!userAccess) {
    return <></>;
  }

  let hasAccessToOrg = true;
  let hasAccessViaPermissions = true;
  // Only do further access checks if the current User is NOT a Sys Admin
  if (!userAccess.isSysAdmin) {
    // If we have an Org Id available to us, check that first
    if (organizationId) {
      const orgUsers = userAccess.me?.user?.orgUsers ?? [];
      const matchingOrgUser = orgUsers.find(
        ou => ou?.orgId === Number(organizationId)
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
        userAccess.isSysAdmin,
        organizationId
      );
    }
  }

  if (!hasAccessToOrg) {
    return <Redirect to={UnauthorizedRoute.generate({})} />;
  }
  if (!hasAccessViaPermissions) {
    switch (props.role) {
      case "admin":
        return (
          <Redirect
            to={UnauthorizedAdminRoleRoute.generate({
              organizationId: organizationId ?? "",
            })}
          />
        );
      case "employee":
        return <Redirect to={UnauthorizedEmployeeRoleRoute.generate({})} />;
      case "substitute":
        return <Redirect to={UnauthorizedSubstituteRoleRoute.generate({})} />;
    }
  }

  if (!Component) {
    return <Route {...rest}>{props.children}</Route>;
  }

  const renderComponent: RenderComponent = props => <Component {...props} />;
  return <Route {...rest} render={renderComponent} />;
};
