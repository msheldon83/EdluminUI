import * as React from "react";
import {
  useMyUserAccess,
  OrgUserPermissions,
} from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { PermissionEnum } from "graphql/server-types.gen";
import { useOrganizationId } from "core/org-context";
import { Tab, TabProps } from "@material-ui/core";

type Props = {
  permissions:
    | PermissionEnum[]
    | ((
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string
      ) => boolean);
} & TabProps;

export const PermittedTab: React.FC<Props> = props => {
  const userAccess = useMyUserAccess();
  const orgId = useOrganizationId();
  const { permissions, ...tabProps } = props;

  let renderTab = false;
  if (Array.isArray(permissions)) {
    renderTab = CanHelper(
      permissions,
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      orgId ?? undefined
    );
  } else {
    renderTab = permissions(
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      orgId ?? undefined
    );
  }

  if (!renderTab) {
    return null;
  }

  return <Tab {...tabProps} />;
};
