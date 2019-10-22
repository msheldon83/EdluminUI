import { useQueryBundle } from "graphql/hooks";
import { useBreakpoint } from "hooks";
import * as React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { GetOrgsForUser } from "ui/app-chrome/organization-switcher/GetOrgsForUser.gen";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { OrganizationsRoute } from "ui/routes/organizations";
import { MobileOrganizationSwitcherUI } from "./mobile-organizations-switcher-ui";
import { OrganizationSwitcherUI } from "./organizations-switcher-ui";

type Props = { contentClassName?: string } & RouteComponentProps;

export const RoutedOrganizationSwitcher: React.FC<Props> = props => {
  const isMobile = useBreakpoint("sm", "down");
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

  const orgUsers = orgUserQuery.data.userAccess.me.user.orgUsers;

  // TODO check if superUser
  const isAdminInOrgs = orgUsers.filter(r => r && r.isAdmin);
  const possibleOrgs = isAdminInOrgs.map(r => r && r.organization);
  if (possibleOrgs.length < 1) {
    return <></>;
  }
  const currentOrganization = possibleOrgs.find(
    org => org && org.id === Number(params.organizationId)
  );

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
          onSwitch={() =>
            props.history.push(OrganizationsRoute.generate(params))
          }
        />
      ) : (
        <OrganizationSwitcherUI
          currentOrganizationName={currentOrganizationName}
          contentClassName={props.contentClassName}
          onSwitch={() =>
            props.history.push(OrganizationsRoute.generate(params))
          }
        />
      )}
    </>
  );
};

export const OrganizationSwitcher = withRouter(RoutedOrganizationSwitcher);
