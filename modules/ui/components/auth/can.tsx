import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { CanDo } from "./types";

type Props = {
  do: CanDo;
  orgId?: string;
  not?: boolean;
};

export const Can: React.FC<Props> = props => {
  const userAccess = useMyUserAccess();
  const contextOrgId = useOrganizationId();
  const { orgId = contextOrgId, not = false } = props;

  const canDoThis = CanHelper(
    props.do,
    userAccess?.permissionsByOrg ?? [],
    userAccess?.isSysAdmin ?? false,
    orgId ?? undefined
  );
  return canDoThis === !not ? <>{props.children}</> : null;
};
