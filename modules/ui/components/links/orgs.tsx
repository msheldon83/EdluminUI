import * as React from "react";
import { BaseLink, LinkOptions, pickUrl } from "./base";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { PermissionEnum } from "graphql/server-types.gen";
import { useMyUserAccess } from "reference-data/my-user-access";

type Props = {
  orgId: string;
} & LinkOptions;

export const OrgLink: React.FC<Props> = ({ orgId, ...props }) => {
  const me = useMyUserAccess()?.me;
  const hasOrgAccess =
    me?.isSystemAdministrator ??
    me?.user?.orgUsers?.find(ou => ou?.orgId === orgId)?.isAdmin;
  if (!hasOrgAccess) {
    return <span className={props.textClass}> {props.children} </span>;
  }
  const urlStr = AdminHomeRoute.generate({
    organizationId: orgId,
  });
  return <BaseLink permissions={[]} to={pickUrl(urlStr)} {...props} />;
};
