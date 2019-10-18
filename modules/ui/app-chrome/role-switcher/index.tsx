import * as React from "react";
import { RoleSwitcherUI } from "./role-switcher-ui";

type Props = {};

export const RoleSwitcher: React.FC<Props> = props => {
  return (
    <RoleSwitcherUI
      selectedRole="Administrator"
      roleOptions={["Administrator", "Employee", "Replacement Employee"]}
    />
  );
};
