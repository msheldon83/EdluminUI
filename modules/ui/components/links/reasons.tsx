import * as React from "react";
import { useOrganizationId } from "core/org-context";
import { PermissionEnum } from "graphql/server-types.gen";
import { AbsenceReasonViewEditRoute } from "ui/routes/absence-reason";
import { BaseLink, LinkOptions, pickUrl } from "./base";

type Props = {
  orgId?: string;
  absenceReasonId: string;
  state?: any;
} & LinkOptions;

export const AbsenceReasonLink: React.FC<Props> = ({
  orgId,
  absenceReasonId,
  state,
  ...props
}) => {
  const contextOrgId = useOrganizationId() ?? undefined;
  orgId = orgId ?? contextOrgId;

  if (!absenceReasonId || !orgId) {
    return <span className={props.textClass}>{props.children}</span>;
  }

  const urlStr = AbsenceReasonViewEditRoute.generate({
    organizationId: orgId,
    absenceReasonId,
  });

  return (
    <BaseLink
      permissions={[PermissionEnum.AbsVacSettingsView]}
      to={{ ...pickUrl(urlStr), state }}
      {...props}
    />
  );
};
