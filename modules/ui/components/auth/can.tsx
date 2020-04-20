import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { CanDo, Role } from "./types";
import { useRole } from "core/role-context";

type Props = {
  do: CanDo;
  orgId?: string;
  not?: boolean;
  context?: any;
};

export const Can: React.FC<Props> = props => {
  const canDoFn = useCanDo();
  const canDoThis = canDoFn(props.do, props.orgId, props.context);

  return canDoThis === !props.not ? <>{props.children}</> : null;
};

export const useCanDo = () => {
  const userAccess = useMyUserAccess();
  const contextOrgId = useOrganizationId();
  const contextRole = useRole();

  const fn = (
    canDo: CanDo,
    orgId?: string | null | undefined,
    context?: any
  ) => {
    orgId = orgId ?? contextOrgId;
    context = context ?? undefined;

    const canDoThis = CanHelper(
      canDo,
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      orgId ?? undefined,
      context ?? undefined,
      contextRole ?? undefined
    );

    return canDoThis;
  };

  return fn;
};
