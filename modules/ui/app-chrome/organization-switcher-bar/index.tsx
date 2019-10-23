import { useQueryBundle } from "graphql/hooks";
import { useScreenSize } from "hooks";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { GetOrgsForUser } from "ui/app-chrome/organization-switcher-bar/GetOrgsForUser.gen";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { OrganizationsRoute } from "ui/routes/organizations";
import { MobileOrganizationSwitcherBarUI } from "./mobile-organizations-switcher-bar-ui";
import { OrganizationSwitcherBarUI } from "./organizations-switcher-bar-ui";
import { GetOrganizationName } from "./GetOrganizationName.gen";

type Props = { contentClassName?: string } & RouteComponentProps;

export const RoutedOrganizationSwitcherBar: React.FC<Props> = props => {
  const isMobile = useScreenSize() === "mobile";
  const params = useRouteParams(AdminChromeRoute);

  const orgUserQuery = useQueryBundle(GetOrgsForUser, {
    fetchPolicy: "cache-and-network",
  });

  let show = false;
  if (
    orgUserQuery.state !== "LOADING" &&
    orgUserQuery.data.userAccess &&
    orgUserQuery.data.userAccess.me &&
    orgUserQuery.data.userAccess.me.user &&
    orgUserQuery.data.userAccess.me.user.orgUsers
  ) {
    const { isSystemAdministrator } = orgUserQuery.data.userAccess.me;

    const { orgUsers } = orgUserQuery.data.userAccess.me.user;

    const isAdminInOrgs = orgUsers.filter(r => r && r.isAdmin);
    const possibleOrgs = isAdminInOrgs.map(r => r && r.organization);
    if (isSystemAdministrator || possibleOrgs.length > 1) {
      show = true;
    }
  }

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
      onSwitch={() => props.history.push(OrganizationsRoute.generate(params))}
    />
  ) : (
    <OrganizationSwitcherBarUI
      currentOrganizationName={currentOrg.data.organization.byId.name}
      contentClassName={props.contentClassName}
      onSwitch={() => props.history.push(OrganizationsRoute.generate(params))}
    />
  );
};

export const OrganizationSwitcherBar = withRouter(
  RoutedOrganizationSwitcherBar
);
