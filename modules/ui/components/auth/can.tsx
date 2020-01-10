import * as React from "react";
import {
  useMyUserAccess,
  OrgUserPermissions,
} from "reference-data/my-user-access";

type Props = {
  do: Function;
  orgId?: string;
};

export const Can: React.FC<Props> = props => {
  const userAccess = useMyUserAccess();
  //execute the do function and return the children
  return props.do(
    userAccess?.permissionsByOrg,
    userAccess?.isSysAdmin,
    props?.orgId
  ) ? (
    <>{props.children}</>
  ) : null;
};
