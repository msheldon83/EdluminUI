import * as React from "react";
import { pickUrl, BaseLink, LinkOptions } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { PersonViewRoute } from "ui/routes/people";
import { useOrganizationId } from "core/org-context";

type Props = {
  orgId?: string;
  orgUserId: string | undefined;
  state?: any;
} & LinkOptions;

const PeopleLink: React.FC<Props & { perms: CanDo }> = ({
  perms,
  orgId,
  orgUserId,
  state,
  ...props
}) => {
  const contextOrgId = useOrganizationId() ?? undefined;
  orgId = orgId ?? contextOrgId;
  if (!orgUserId || !orgId) {
    return <span className={props.textClass}> {props.children} </span>;
  }
  const urlStr = PersonViewRoute.generate({
    organizationId: orgId ?? contextOrgId,
    orgUserId,
  });
  return (
    <BaseLink
      permissions={perms}
      to={{ ...pickUrl(urlStr), state: state }}
      {...props}
    />
  );
};

export const AdminLink: React.FC<Props> = props => (
  <PeopleLink perms={[PermissionEnum.AdminView]} {...props} />
);

export const EmployeeLink: React.FC<Props> = props => (
  <PeopleLink perms={[PermissionEnum.EmployeeView]} {...props} />
);
export const SubstituteLink: React.FC<Props> = props => (
  <PeopleLink perms={[PermissionEnum.SubstituteView]} {...props} />
);
