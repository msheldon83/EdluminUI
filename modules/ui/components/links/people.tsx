import * as React from "react";
import { pickUrl, BaseLink } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { PersonViewRoute } from "ui/routes/people";
import { useOrganizationId } from "core/org-context";

type Props = {
  perms: CanDo;
  orgId?: string;
  orgUserId: string | undefined;
  state?: any;
  linkClass?: string;
  textClass?: string;
  color?: "blue" | "black";
};

const PeopleLink: React.FC<Props> = ({
  perms,
  orgId,
  orgUserId,
  state,
  ...props
}) => {
  const contextOrgId = useOrganizationId();
  if (orgUserId === undefined) {
    return <span className={props.textClass}> {props.children} </span>;
  }
  const urlStr = PersonViewRoute.generate({
    organizationId: orgId ?? contextOrgId!,
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

type SpecificProps = {
  orgId?: string;
  orgUserId: string | undefined;
  state?: any;
  linkClass?: string;
  textClass?: string;
  color?: "blue" | "black";
};

export const EmployeeLink: React.FC<SpecificProps> = props => (
  <PeopleLink perms={[PermissionEnum.EmployeeView]} {...props} />
);
export const SubstituteLink: React.FC<SpecificProps> = props => (
  <PeopleLink perms={[PermissionEnum.SubstituteView]} {...props} />
);
