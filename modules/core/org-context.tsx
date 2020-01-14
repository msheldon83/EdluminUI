import * as React from "react";
import { createContext, useContext } from "react";
import { AdminRootChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

export const OrganizationContext = createContext<string | null>(null);
export const useOrganizationId = () => useContext(OrganizationContext);

export const AdminRouteOrganizationContextProvider: React.FC = props => {
  const params = useRouteParams(AdminChromeRoute);
  return (
    <OrganizationContext.Provider value={params.organizationId}>
      {props.children}
    </OrganizationContext.Provider>
  );
};
