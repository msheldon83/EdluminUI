import { useQueryBundle } from "graphql/hooks";
import { useIsMobile } from "hooks";
import * as React from "react";
import { useHistory } from "react-router";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { OrganizationsRoute } from "ui/routes/organizations";
import { useIsSystemAdminOrAdminInMultipleOrgs } from "../hooks";
import { GetOrganizationName } from "./GetOrganizationName.gen";
import { MobileOrganizationSwitcherBarUI } from "./mobile-organizations-switcher-bar-ui";
import { OrganizationSwitcherBarUI } from "./organizations-switcher-bar-ui";

type Props = { contentClassName?: string };

export const OrganizationSwitcherBar: React.FC<Props> = props => {
  const isMobile = useIsMobile();
  const params = useRouteParams(AdminChromeRoute);
  const history = useHistory();
  let show = useIsSystemAdminOrAdminInMultipleOrgs();

  // If the user has not yet selected an org, this param will not be a valid Number
  // and trying to run the Gql query will blow up
  if (isNaN(+params.organizationId)) {
    show = false;
  }

  const currentOrg = useQueryBundle(GetOrganizationName, {
    variables: { id: params.organizationId },
    fetchPolicy: "cache-first",
    skip: !show,
  });

  if (
    !show ||
    currentOrg.state === "LOADING" ||
    !currentOrg.data.organization ||
    !currentOrg.data.organization.byId ||
    !currentOrg.data.organization.byId.name
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
