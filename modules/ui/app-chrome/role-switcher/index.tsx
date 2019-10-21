import * as React from "react";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { useQueryBundle } from "../../../graphql/hooks";
import { QueryOrgUserRoles } from "ui/role-switcher/QueryOrgUserRoles.gen";

type Props = {
  roles: string[];
};

// //GQL query
export const RoleSwitcher: React.FC<Props> = props => {
  const OrgUserRoles = useQueryBundle(QueryOrgUserRoles);
  OrgUserRoles.props.roles;

  const orgUserRoles = {
    isAdmin: props.roles,
    isEmployee: props.roles,
    isReplacementEmployee: props.roles,
  };

  return (
    <RoleSwitcherUI
      selectedRole="Administrator"
      roleOptions={["Administrator", "Employee", "Replacement Employee"]}
    />
  );
};
