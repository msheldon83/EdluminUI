import * as React from "react";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { some } from "lodash-es";
import { useQueryBundle } from "graphql/hooks";
import { GetMyUserAccess } from "reference-data/get-my-user-access.gen";
import { AppChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";

type Props = {
  expanded: boolean;
};

export const RoleSwitcher: React.FC<Props> = props => {
  const orgUserQuery = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  const params = useRouteParams(AppChromeRoute);

  if (orgUserQuery.state === "LOADING") {
    return <></>;
  }

  const userAccess = orgUserQuery?.data?.userAccess?.me ?? {
    isSystemAdministrator: false,
    user: null,
  };

  const orgUser = userAccess?.user?.orgUsers ?? [
    {
      id: "never",
      isAdmin: false,
      isEmployee: false,
      isReplacementEmployee: false,
    },
  ];

  const roles = {
    isAdmin: some(orgUser, "isAdmin"),
    isEmployee: some(orgUser, "isEmployee"),
    isReplacementEmployee: some(orgUser, "isReplacementEmployee"),
  };

  const roleOptions: { name: string; value: string }[] = [];
  roles.isAdmin && roleOptions.push({ name: "Administrator", value: "admin" });
  roles.isEmployee && roleOptions.push({ name: "Employee", value: "employee" });
  roles.isReplacementEmployee &&
    roleOptions.push({ name: "Substitute", value: "substitute" });

  // Not showing the role switcher if the user is a system admin, or only has one role
  if (userAccess.isSystemAdministrator || roleOptions.length === 1) {
    return <></>;
  }

  return (
    <RoleSwitcherUI
      selectedRole={params.role}
      roleOptions={roleOptions}
      expanded={props.expanded}
    />
  );
};
