import * as React from "react";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { some } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { QueryOrgUserRoles } from "ui/app-chrome/role-switcher/QueryOrgUserRoles.gen";
import { oc } from "ts-optchain";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  expanded: boolean;
};

export const RoleSwitcher: React.FC<Props> = props => {
  const orgUserQuery = useQueryBundle(QueryOrgUserRoles, {
    fetchPolicy: "cache-and-network",
  });

  if (orgUserQuery.state === "LOADING") {
    return <></>;
  }

  const userAccess = oc(orgUserQuery).data.userAccess.me();

  const roles = {
    isAdmin: some(userAccess.user.orgUsers, "isAdmin"),
    isEmployee: some(userAccess.user.orgUsers, "isEmployee"),
    isReplacementEmployee: some(
      userAccess.user.orgUsers,
      "isReplacementEmployee"
    ),
  };

  const roleOptions: string[] = [];
  roles.isAdmin && roleOptions.push("Administrator");
  roles.isEmployee && roleOptions.push("Employee");
  roles.isReplacementEmployee && roleOptions.push("Substitute");

  // Not showing the role switcher if the user is a system admin, or only has one role
  if (userAccess.isSystemAdministrator || roleOptions.length === 1) {
    return <></>;
  }

  const params = useRouteParams(AppChromeRoute);
  const selectedRole = params.role.charAt(0).toUpperCase();

  return (
    <RoleSwitcherUI
      selectedRole={selectedRole}
      roleOptions={roleOptions}
      expanded={props.expanded}
    />
  );
};
