import * as React from "react";
import { GetOrganizationName } from "../organization-switcher-bar/GetOrganizationName.gen";
import { useQueryBundle } from "graphql/hooks";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { OrganizationType } from "graphql/server-types.gen";
import {
  Grid,
  Typography,
  makeStyles,
  Toolbar,
  AppBar,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";

type Props = {};

export const OrganizationStatusBar: React.FC<Props> = props => {
  const params = useRouteParams(AdminChromeRoute);
  const classes = useStyles();
  const toolbarClasses = useToolbarClasses();
  const { t } = useTranslation();

  const currentOrgStatus = useQueryBundle(GetOrganizationName, {
    variables: { id: params.organizationId },
    fetchPolicy: "cache-first",
    skip: !params.organizationId,
  });

  if (
    currentOrgStatus.state === "LOADING" ||
    !currentOrgStatus.data.organization ||
    !currentOrgStatus.data.organization.byId ||
    !currentOrgStatus.data.organization.byId.config ||
    currentOrgStatus.data.organization.byId.config.organizationTypeId !==
      OrganizationType.Implementing
  ) {
    return <></>;
  }

  return (
    <>
      <AppBar position="sticky" className={classes.topBar}>
        <Toolbar classes={toolbarClasses}>
          <div>
            <Grid container alignItems="center" justify="space-between">
              <Typography className={classes.orgName}>
                {currentOrgStatus.data.organization.byId.name}&nbsp;
              </Typography>
              <Typography className={classes.text}>{`${t("is currently in")} ${
                currentOrgStatus.data.organization.byId.config
                  .organizationTypeId
              } ${t("mode")}`}</Typography>
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
  orgName: {
    color: theme.customColors.darkBlueGray,
    fontWeight: 500,
  },
}));

const useToolbarClasses = makeStyles(theme => ({
  root: {
    minHeight: theme.typography.pxToRem(34),
  },
}));
