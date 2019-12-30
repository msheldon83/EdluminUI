import * as React from "react";
import { makeStyles, Tooltip } from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {
  inviteSent: boolean;
  accountSetup: boolean;
};

export const AccessIcon: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (props.accountSetup) {
    // User is all set up, nothing to see here
    return null;
  } else if (props.inviteSent) {
    // Invite has been sent, but user hasn't finished setting up their account yet
    return (
      <Tooltip title={t("Invite pending acceptance")}>
        <div className={[classes.circle, classes.invitePending].join(" ")} />
      </Tooltip>
    );
  } else {
    // No invite has been sent to the User
    return (
      <Tooltip title={t("No invite sent")}>
        <div className={[classes.circle, classes.noInvite].join(" ")} />
      </Tooltip>
    );
  }
};

const useStyles = makeStyles(theme => ({
  circle: {
    marginLeft: theme.spacing(),
    borderRadius: "50%",
    width: theme.typography.pxToRem(20),
    height: theme.typography.pxToRem(20),
    paddingTop: theme.typography.pxToRem(2),
    color: theme.customColors.white,
    fontWeight: "bold",
  },
  noInvite: {
    backgroundColor: theme.customColors.darkRed,
  },
  invitePending: {
    backgroundColor: theme.customColors.marigold,
  },
}));
