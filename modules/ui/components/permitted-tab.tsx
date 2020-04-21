import * as React from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { can as CanHelper } from "helpers/permissions";
import { useOrganizationId } from "core/org-context";
import { Tab, TabProps, makeStyles } from "@material-ui/core";
import { CanDo } from "./auth/types";
import { useRole } from "core/role-context";

type Props = {
  permissions: CanDo;
} & TabProps;

export const PermittedTab: React.FC<Props> = props => {
  const classes = useStyles();
  const userAccess = useMyUserAccess();
  const orgId = useOrganizationId();
  const contextRole = useRole();
  const { permissions, ...tabProps } = props;

  const showTab = CanHelper(
    permissions,
    userAccess?.permissionsByOrg ?? [],
    userAccess?.isSysAdmin ?? false,
    orgId ?? undefined,
    contextRole ?? undefined
  );

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
