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

type Props = { contentClassName?: string } & RouteComponentProps;

export const RoutedOrganizationSwitcherBar: React.FC<Props> = props => {
  const isMobile = useScreenSize() === "mobile";
  const params = useRouteParams(AdminChromeRoute);

  const orgUserQuery = useQueryBundle(GetOrgsForUser, {
    fetchPolicy: "cache-and-network",
  });

  if (
    orgUserQuery.state === "LOADING" ||
    !orgUserQuery.data.userAccess ||
    !orgUserQuery.data.userAccess.me ||
    !orgUserQuery.data.userAccess.me.user ||
    !orgUserQuery.data.userAccess.me.user.orgUsers
  ) {
    return <></>;
  }
  // TODO check if superUser
  const { isSystemAdministrator } = orgUserQuery.data.userAccess.me;

  const { orgUsers } = orgUserQuery.data.userAccess.me.user;

  const isAdminInOrgs = orgUsers.filter(r => r && r.isAdmin);
  const possibleOrgs = isAdminInOrgs.map(r => r && r.organization);
  if (possibleOrgs.length < 1) {
    return <></>;
  }
  const currentOrganization = possibleOrgs.find(
    org => org && org.id === params.organizationId
  );

  const currentOrganizationName =
    currentOrganization && currentOrganization.name;

  if (!currentOrganizationName) {
    return <></>;
  }

  return isMobile ? (
    <MobileOrganizationSwitcherBarUI
      currentOrganizationName={currentOrganizationName}
      onSwitch={() => props.history.push(OrganizationsRoute.generate(params))}
    />
  ) : (
    <OrganizationSwitcherBarUI
      currentOrganizationName={currentOrganizationName}
      contentClassName={props.contentClassName}
      onSwitch={() => props.history.push(OrganizationsRoute.generate(params))}
    />
  );
};

export const OrganizationSwitcherBar = withRouter(
  RoutedOrganizationSwitcherBar
);
