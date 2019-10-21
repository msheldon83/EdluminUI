import * as React from "react";
import { OrganizationSwitcherUI } from "./organizations-switcher-ui";
import { useBreakpoint } from "hooks";
import { MobileOrganizationSwitcherUI } from "./mobile-organizations-switcher-ui";
import { withRouter, RouteComponentProps } from "react-router";
import { Organizations } from "ui/routes/organizations";
import { GetOrgsForUser } from "ui/app-chrome/organization-switcher/GetOrgsForUser.gen";
import { useQueryBundle } from "graphql/hooks";

type Props = { contentClassName?: string } & RouteComponentProps;

export const RoutedOrganizationSwitcher: React.FC<Props> = props => {
  const isMobile = useBreakpoint("sm", "down");

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

  const orgUsers = orgUserQuery.data.userAccess.me.user.orgUsers;

  const isAdminInOrgs = orgUsers.filter(r => r && r.isAdmin);
  const possibleOrgs = isAdminInOrgs.map(r => r && r.organization);
  if (possibleOrgs.length < 1) {
    return <></>;
  }
  const currentOrganization = possibleOrgs.find(
    org => org && Number(org.id) === 1
  ); // get from URL

  const currentOrganizationName =
    currentOrganization && currentOrganization.name;

  if (!currentOrganizationName) {
    return <></>;
  }

  return (
    <>
      {isMobile ? (
        <MobileOrganizationSwitcherUI
          currentOrganizationName={currentOrganizationName}
          onSwitch={() => props.history.push(Organizations.PATH_TEMPLATE)}
        />
      ) : (
        <OrganizationSwitcherUI
          currentOrganizationName={currentOrganizationName}
          contentClassName={props.contentClassName}
          onSwitch={() => props.history.push(Organizations.PATH_TEMPLATE)}
        />
      )}
    </>
  );
};

export const OrganizationSwitcher = withRouter(RoutedOrganizationSwitcher);
