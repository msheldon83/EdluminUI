import * as React from "react";
import { NavigationSideBar } from "../navigation";
import { Route } from "react-router-dom";
import { RoleSwitcherUI } from "./role-switcher-ui";

export default {
  title: "Components/Role Switcher",
};

export const nav = () => {
  return (
    <RoleSwitcherUI
      selectedRole="Administrator"
      roleOptions={["Administrator", "Employee", "Replacement Employee"]}
    />
  );
};

nav.story = {
  name: "Open",
};
