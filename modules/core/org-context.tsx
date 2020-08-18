import * as React from "react";
import { createContext, useContext, useEffect } from "react";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { usePageTitleContext } from "ui/app-chrome/page-title-context";

export const OrganizationContext = createContext<string | null>(null);
export const useOrganizationId = () => useContext(OrganizationContext);

export const AdminRouteOrganizationContextProvider: React.FC = props => {
  const { supplyOrganizationId } = usePageTitleContext();
  const { organizationId } = useRouteParams(AdminChromeRoute);
  useEffect(() => supplyOrganizationId(organizationId), [
    organizationId,
    supplyOrganizationId,
  ]);
  return (
    <OrganizationContext.Provider value={organizationId}>
      {props.children}
    </OrganizationContext.Provider>
  );
};

/**** If the component is not under an AdminRouteOrganizationContextProvider */
/****  we need to do this to grab the org id. */
/**** Our Logic is if the user is in the admin context of a specific org, */
/**** we will send that org.  For every other context we will not send orgs and allow */
/**** the server to decide which orgs the user has access to */
export const getOrgIdFromRoute = () => {
  const orgId: string | undefined =
    window.location.pathname.includes("admin") &&
    Number(window.location.pathname.split("/")[2]) > 0
      ? window.location.pathname.split("/")[2]
      : undefined;
  return orgId;
};
