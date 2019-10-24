import { useQueryBundle } from "graphql/hooks";
import { useScreenSize } from "hooks";
import * as React from "react";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { OrganizationsRoute } from "ui/routes/organizations";
import { MobileOrganizationSwitcherBarUI } from "./mobile-organizations-switcher-bar-ui";
import { OrganizationSwitcherBarUI } from "./organizations-switcher-bar-ui";
import { GetOrganizationName } from "./GetOrganizationName.gen";
import { useHistory } from "react-router";
import { useIsSystemAdminOrAdminInMultipleOrgs } from "../hooks";

type Props = { contentClassName?: string };

export const OrganizationSwitcherBar: React.FC<Props> = props => {
  const isMobile = useScreenSize() === "mobile";
  const params = useRouteParams(AdminChromeRoute);
  const history = useHistory();
  const show = useIsSystemAdminOrAdminInMultipleOrgs();

  const currentOrg = useQueryBundle(GetOrganizationName, {
    variables: { id: params.organizationId },
    fetchPolicy: "cache-first",
    skip: !show,
  });

  if (
    !show ||
    (currentOrg.state === "LOADING" ||
      !currentOrg.data.organization ||
      !currentOrg.data.organization.byId ||
      !currentOrg.data.organization.byId.name)
  ) {
    return <></>;
  }

  return isMobile ? (
    <MobileOrganizationSwitcherBarUI
      currentOrganizationName={currentOrg.data.organization.byId.name}
      onSwitch={() => history.push(OrganizationsRoute.generate(params))}
    />
  ) : (
    <OrganizationSwitcherBarUI
      currentOrganizationName={currentOrg.data.organization.byId.name}
      contentClassName={props.contentClassName}
      onSwitch={() => history.push(OrganizationsRoute.generate(params))}
    />
  );
};
