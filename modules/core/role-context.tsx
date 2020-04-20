import * as React from "react";
import { createContext, useContext } from "react";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

export const RoleContext = createContext<string | null>(null);
export const useRole = () => useContext(RoleContext);

export const RoleContextProvider: React.FC = props => {
  const { role } = useRouteParams(AppChromeRoute);
  return (
    <RoleContext.Provider value={role}>{props.children}</RoleContext.Provider>
  );
};
