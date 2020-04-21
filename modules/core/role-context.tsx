import * as React from "react";
import { createContext, useContext } from "react";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { Role } from "ui/components/auth/types";

export const RoleContext = createContext<Role | null>(null);
export const useRole = () => useContext(RoleContext);

export const RoleContextProvider: React.FC = props => {
  const { role } = useRouteParams(AppChromeRoute);
  return (
    <RoleContext.Provider value={role as Role}>
      {props.children}
    </RoleContext.Provider>
  );
};
