import * as React from "react";
import {
  Grid,
  Typography,
  makeStyles,
  Toolbar,
  AppBar,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useMemo, useCallback } from "react";
import { useMyUserAccess } from "reference-data/my-user-access";
import { Close } from "@material-ui/icons";
import { useHistory } from "react-router";
import { useIsImpersonating } from "reference-data/is-impersonating";
import { useApolloClient } from "@apollo/react-hooks";

type Props = {};

export const ImpersonationStatusBar: React.FC<Props> = props => {
  const classes = useStyles();
  const toolbarClasses = useToolbarClasses();
  const { t } = useTranslation();
  const history = useHistory();
  const userAccess = useMyUserAccess();
  const client = useApolloClient();

  // Remove keys from session storage and redirect to root of site
  const cancelImpersonation = useCallback(async () => {
    const impersonatingOrgId = sessionStorage.getItem(
      Config.impersonation.impersonatingOrgId
    );
    const impersonatingOrgUserId = sessionStorage.getItem(
      Config.impersonation.actingOrgUserIdKey
    );

    sessionStorage.removeItem(Config.impersonation.actingUserIdKey);
    sessionStorage.removeItem(Config.impersonation.actingOrgUserIdKey);
    sessionStorage.removeItem(Config.impersonation.impersonatingOrgId);

    // To prevent issues with cached data from the current impersonated user
    // prior to ending impersonation, let's clear out the Apollo cache
    await client.clearStore();

    history.push({
      pathname: "/",
      state: { impersonatingOrgId, impersonatingOrgUserId },
    });
  }, [client, history]);

  const userDisplayName = useMemo(() => {
    if (userAccess?.me?.user?.firstName && userAccess?.me?.user?.lastName) {
      return `${userAccess?.me?.user?.firstName} ${userAccess?.me?.user?.lastName}`;
    }
    return "";
  }, [userAccess?.me?.user?.firstName, userAccess?.me?.user?.lastName]);

  // Figure out if we are currently impersonating or not
  const isImpersonating = useIsImpersonating();

  if (!isImpersonating) {
    return <></>;
  }

  return (
    <>
      <AppBar position="sticky" className={classes.topBar}>
        <Toolbar classes={toolbarClasses}>
          <div>
            <Grid container alignItems="center" justify="space-between">
              <Typography className={classes.text}>
                {t("You are currently impersonating")} {userDisplayName}
              </Typography>
              <Button
                onClick={cancelImpersonation}
                className={classes.button}
                endIcon={<Close />}
              >
                {t("Stop Impersonating")}
              </Button>
            </Grid>
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  topBar: {
    top: 0,
    paddingLeft: "-225px",
    background: "#FFCC01",
    "@media print": {
      display: "none",
    },
  },
  text: {
    color: theme.customColors.darkBlueGray,
    fontWeight: 500,
  },
  button: {
    marginLeft: theme.spacing(4),
    paddingTop: 0,
    paddingBottom: 0,
    "&:hover": {
      backgroundColor: "inherit",
    },
  },
}));

const useToolbarClasses = makeStyles(theme => ({
  root: {
    minHeight: theme.typography.pxToRem(34),
  },
}));
