import * as React from "react";
import { pickUrl, BaseLink } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { PersonViewRoute } from "ui/routes/people";

type Props = {
  orgId: string;
  orgUserId: string | undefined;
  state?: any;
  linkClass?: string;
  canWrapper?: (children: React.ReactNode) => React.ReactNode;
  cannotWrapper?: (children: React.ReactNode) => React.ReactNode;
};

const PeopleLink: (perms: CanDo) => React.FC<Props> = perms => ({
  orgId,
  orgUserId,
  state,
  ...props
}) => {
  if (orgUserId === undefined) {
    return <> children </>;
  }
  const urlStr = PersonViewRoute.generate({
    organizationId: orgId,
    orgUserId: orgUserId,
  });
  return (
    <BaseLink
      permissions={perms}
      to={{ ...pickUrl(urlStr), state: state }}
      {...props}
    />
  );
};

export const EmployeeLink = PeopleLink([PermissionEnum.EmployeeView]);
export const SubstituteLink = PeopleLink([PermissionEnum.SubstituteView]);
