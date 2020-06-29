import { useQueryBundle } from "graphql/hooks";
import { some } from "lodash-es";
import * as React from "react";
import { Redirect } from "react-router-dom";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { AdminRootChromeRoute } from "ui/routes/app-chrome";
import { useHistory } from "react-router";
import { EmployeeHomeRoute } from "ui/routes/employee-home";
import { SubHomeRoute } from "ui/routes/sub-home";
import { PersonViewRoute } from "ui/routes/people";

export const IndexPage: React.FunctionComponent = props => {
  const history = useHistory();
  const orgUserQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "network-only",
  });

  if (orgUserQuery.state === "LOADING") {
    return <></>;
  }

  const userAccess = orgUserQuery?.data?.userAccess?.me ?? {
    isSystemAdministrator: false,
    user: null,
  };

  const orgUsers = userAccess?.user?.orgUsers ?? [
    {
      id: "never",
      isAdmin: false,
      isEmployee: false,
      isReplacementEmployee: false,
      orgId: "0",
    },
  ];

  const roles = {
    isAdmin: some(orgUsers, "isAdmin"),
    isEmployee: some(orgUsers, "isEmployee"),
    isReplacementEmployee: some(orgUsers, "isReplacementEmployee"),
    isSystemAdministrator: userAccess.isSystemAdministrator,
    multiOrgs: orgUsers.length > 1,
  };

  const impersonatingOrgId = history.location.state?.impersonatingOrgId;
  const impersonatingOrgUserId = history.location.state?.impersonatingOrgUserId;

  // Send the user to the Organization switcher if they are a sys admin or admin in multiple orgs
  // If an admin in one org, send them to that org page
  // If they are an employee send them to the employee page
  // Otherwise, they must be a sub
  // If a combination of roles, they will go to admin first, then employee, then sub
  return (
    <>
      {impersonatingOrgId && impersonatingOrgUserId ? (
        <Redirect
          to={PersonViewRoute.generate({
            organizationId: impersonatingOrgId,
            orgUserId: impersonatingOrgUserId,
          })}
        />
      ) : roles.isSystemAdministrator || (roles.isAdmin && roles.multiOrgs) ? (
        <Redirect to={AdminRootChromeRoute.generate({})} />
      ) : roles.isAdmin && !roles.multiOrgs ? (
        <Redirect
          to={AdminHomeRoute.generate({
            organizationId: String(orgUsers[0]?.orgId),
          })}
        />
      ) : roles.isEmployee ? (
        <Redirect to={EmployeeHomeRoute.generate({ role: "employee" })} />
      ) : (
        <Redirect to={SubHomeRoute.generate({ role: "subsittute" })} />
      )}
    </>
  );
};
