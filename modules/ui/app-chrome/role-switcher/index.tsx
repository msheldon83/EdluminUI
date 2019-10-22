import * as React from "react";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { some } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { QueryOrgUserRoles } from "ui/app-chrome/role-switcher/QueryOrgUserRoles.gen";

type Props = {};

export const RoleSwitcher: React.FC<Props> = props => {
  const orgUserQuery = useQueryBundle(QueryOrgUserRoles, {
    fetchPolicy: "cache-and-network",
  });

  if (
    orgUserQuery.state === "LOADING" ||
    !orgUserQuery.data.userAccess ||
    !orgUserQuery.data.userAccess.me ||
    !orgUserQuery.data.userAccess.me.user
  ) {
    return <></>;
  }

  const isSystemAdministrator =
    orgUserQuery.data.userAccess.me.isSystemAdministrator;

  if (isSystemAdministrator) {
    return <></>;
  }

  if (!orgUserQuery.data.userAccess.me.user.orgUsers) {
    return <></>;
  }

  const orgUserRoles = orgUserQuery.data.userAccess.me.user.orgUsers;

  //Find elidgable roles in the orgUserRoles array
  const roles = {
    isAdmin: some(orgUserRoles, r => r.isAdmin),
    isEmployee: some(orgUserRoles, r => r.isEmployee),
    isReplacementEmployee: some(orgUserRoles, r => r.isReplacementEmployee),
  };

  if (roles.isAdmin && roles.isEmployee && roles.isReplacementEmployee) {
    return (
      <RoleSwitcherUI
        selectedRole="Administrator"
        roleOptions={["Administrator", "Employee", "Replacement Employee"]}
      />
    );
  }
  if (roles.isAdmin && roles.isEmployee) {
    return (
      <RoleSwitcherUI
        selectedRole="Administrator"
        roleOptions={["Administrator", "Employee"]}
      />
    );
  }
  if (roles.isAdmin && roles.isReplacementEmployee) {
    return (
      <RoleSwitcherUI
        selectedRole="Administrator"
        roleOptions={["Administrator", "Replacement Employee"]}
      />
    );
  }
  if (roles.isEmployee && roles.isReplacementEmployee) {
    return (
      <RoleSwitcherUI
        selectedRole="Employee"
        roleOptions={["Employee", "Replacement Employee"]}
      />
    );
  } else {
    return <></>;
  }
};
