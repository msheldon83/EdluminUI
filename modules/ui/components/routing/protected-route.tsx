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
import {
  NotFoundAdminRootRoute,
  NotFoundAdminRoleRoute,
  NotFoundEmployeeRoleRoute,
  NotFoundSubstituteRoleRoute,
} from "ui/routes/not-found";
import { PermissionEnum } from "graphql/server-types.gen";
import { can } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";

// Copied from https://stackoverflow.com/a/52366872 and tweaked

interface ProtectedRouteProps extends RouteProps {
  role: "employee" | "substitute" | "admin" | "sysAdmin";
  component?:
    | React.ComponentType<RouteComponentProps<any>>
    | React.ComponentType<any>;
  permissions?: PermissionEnum[];
  devFeatureOnly?: boolean;
}
type RenderComponent = (props: RouteComponentProps<any>) => React.ReactNode;

export const ProtectedRoute: React.FC<ProtectedRouteProps> = props => {
  const { component: Component, ...rest } = props;
  const organizationId = useOrganizationId();

  const userAccess = useMyUserAccess();
  if (!userAccess) {
    return <></>;
  }

  // If this route is to be only allowed in dev, this will send the user to a not found page when in prod.
  if (props.devFeatureOnly && !Config.isDevFeatureOnly) {
    switch (props.role) {
      case "admin":
      case "sysAdmin":
        return organizationId === undefined ? (
          <Redirect
            to={NotFoundAdminRoleRoute.generate({
              organizationId: organizationId ?? "",
            })}
          />
        ) : (
          <Redirect to={NotFoundAdminRootRoute.generate({})} />
        );
      case "employee":
        return <Redirect to={NotFoundEmployeeRoleRoute.generate({})} />;
      case "substitute":
        return <Redirect to={NotFoundSubstituteRoleRoute.generate({})} />;
    }
  }

  // Support blocking routes for non Sys Admins
  if (props.role === "sysAdmin" && !userAccess.isSysAdmin) {
    return <Redirect to={UnauthorizedRoute.generate({})} />;
  }

  let hasAccessToOrg = true;
  let hasAccessViaPermissions = true;
  // Only do further access checks if the current User is NOT a Sys Admin
  if (!userAccess.isSysAdmin) {
    // If we have an Org Id available to us, check that first
    if (organizationId) {
      const orgUsers = userAccess.me?.user?.orgUsers ?? [];
      // We need to get the first orgUser that is an admin in the org in case they have other orgs users with non-admin roles
      hasAccessToOrg = orgUsers.some(
        ou => ou?.orgId === organizationId && ou?.isAdmin
      );
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
