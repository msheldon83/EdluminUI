import * as React from "react";
import { createContext, useContext, useEffect } from "react";
import { AdminRootChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { usePageTitleContext } from "ui/app-chrome/page-title-context";

export const OrganizationContext = createContext<string | null>(null);
export const useOrganizationId = () => useContext(OrganizationContext);

export const AdminRouteOrganizationContextProvider: React.FC = props => {
  const { supplyOrganizationId } = usePageTitleContext();
  const { organizationId } = useRouteParams(AdminChromeRoute);
  useEffect(() => supplyOrganizationId(organizationId), [organizationId]);
  return (
    <OrganizationContext.Provider value={organizationId}>
      {props.children}
    </OrganizationContext.Provider>
  );
};
