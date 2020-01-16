import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { Tab, TabProps, makeStyles } from "@material-ui/core";
import { CanDo } from "./auth/types";

type Props = {
  permissions: CanDo;
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
