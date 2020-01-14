import * as React from "react";
import {
  useMyUserAccess,
  OrgUserPermissions,
} from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { PermissionEnum } from "graphql/server-types.gen";

type Props = {
  do:
    | PermissionEnum[]
    | ((
        permissions: OrgUserPermissions[],
        isSysAdmin: boolean,
        orgId?: string
      ) => boolean);
  orgId?: string;
  not?: boolean;
};

export const Can: React.FC<Props> = props => {
  const userAccess = useMyUserAccess();
  const { not = false } = props;

  let canDoThis = false;
  if (Array.isArray(props.do)) {
    canDoThis = CanHelper(
      props.do,
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      props?.orgId
    );
  } else {
    canDoThis = props.do(
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      props?.orgId
    );
  }
  return canDoThis === !not ? <>{props.children}</> : null;
};
