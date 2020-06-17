import * as React from "react";
import { useOrganizationId } from "core/org-context";
import { PermissionEnum } from "graphql/server-types.gen";
import { EmployeeBalanceReportRoute } from "ui/routes/people";
import { BaseLink, LinkOptions, pickUrl } from "./base";

type EmployeeBalanceProps = {
  orgId?: string;
  employeeId: string | undefined;
  reasonId: string | undefined;
  state?: any;
} & LinkOptions;

export const EmployeeBalanceReportLink: React.FC<EmployeeBalanceProps> = ({
  orgId,
  employeeId,
  reasonId,
  state,
  ...props
}) => {
  const contextOrgId = useOrganizationId() ?? undefined;
  orgId = orgId ?? contextOrgId;

  if (!orgId || !employeeId || !reasonId) {
    return <span className={props.textClass}>{props.children}</span>;
  }

  const urlStr = `${EmployeeBalanceReportRoute.generate({
    organizationId: orgId,
    orgUserId: employeeId,
  })}?reasonId=${reasonId}`;

  return (
    <BaseLink
      permissions={[PermissionEnum.EmployeeViewBalances]}
      to={{ ...pickUrl(urlStr), state }}
      {...props}
    />
  );
};
