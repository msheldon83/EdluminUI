import * as React from "react";
import { OrgUserRole } from "graphql/server-types.gen";
import { useMyUserAccess } from "reference-data/my-user-access";
import { some } from "lodash-es";

export const IfHasRole: React.FC<{
  role: OrgUserRole;
  not?: boolean;
}> = props => {
  const userAccess = useMyUserAccess();
  if (!userAccess) {
    return <></>;
  }

  if (userAccess.me?.isSystemAdministrator && !props.not) {
    return <>{props.children}</>;
  }

  let canRender = false;
  switch (props.role) {
    case OrgUserRole.Administrator:
      canRender =
        some(userAccess.me?.user?.orgUsers ?? [], "isAdmin") !== !!props.not;
      break;
    case OrgUserRole.Employee:
      canRender =
        some(userAccess.me?.user?.orgUsers ?? [], "isEmployee") !== !!props.not;
      break;
    case OrgUserRole.ReplacementEmployee:
      canRender =
        some(userAccess.me?.user?.orgUsers ?? [], "isReplacementEmployee") !==
        !!props.not;
      break;
  }

  return canRender ? <>{props.children}</> : <></>;
};
