import * as React from "react";
import { useOrganizationId } from "core/org-context";
import { PermissionEnum } from "graphql/server-types.gen";
import { PositionTypeViewRoute } from "ui/routes/position-type";
import { BaseLink, LinkOptions, pickUrl } from "./base";

type Props = {
  orgId?: string;
  positionTypeId: string;
  state?: any;
} & LinkOptions;

export const PositionTypeLink: React.FC<Props> = ({
  orgId,
  positionTypeId,
  state,
  ...props
}) => {
  const contextOrgId = useOrganizationId() ?? undefined;
  orgId = orgId ?? contextOrgId;

  if (!positionTypeId || !orgId) {
    return <span className={props.textClass}>{props.children}</span>;
  }

  const urlStr = PositionTypeViewRoute.generate({
    organizationId: orgId,
    positionTypeId,
  });

  return (
    <BaseLink
      permissions={[PermissionEnum.FinanceSettingsView]}
      to={{ ...pickUrl(urlStr), state }}
      {...props}
    />
  );
};
