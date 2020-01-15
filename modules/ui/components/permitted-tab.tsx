import * as React from "react";
import {
  useMyUserAccess,
  OrgUserPermissions,
} from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { PermissionEnum } from "graphql/server-types.gen";
import { useOrganizationId } from "core/org-context";
import { Tab, TabProps, makeStyles } from "@material-ui/core";

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
  const classes = useStyles();
  const userAccess = useMyUserAccess();
  const orgId = useOrganizationId();
  const { permissions, ...tabProps } = props;

  let showTab = false;
  if (Array.isArray(permissions)) {
    showTab = CanHelper(
      permissions,
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      orgId ?? undefined
    );
  } else {
    showTab = permissions(
      userAccess?.permissionsByOrg ?? [],
      userAccess?.isSysAdmin ?? false,
      orgId ?? undefined
    );
  }

  return showTab ? (
    <Tab {...tabProps} />
  ) : (
    <Tab {...tabProps} className={classes.hidden} />
  );
};

const useStyles = makeStyles(theme => ({
  hidden: {
    display: "none",
  },
}));
