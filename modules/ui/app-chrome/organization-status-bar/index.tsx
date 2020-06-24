import * as React from "react";
import { GetOrganization } from "./graphql/get-organization.gen";
import { GoLive } from "./graphql/go-live.gen";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { AdminChromeRoute } from "ui/routes/app-chrome";
import { useRouteParams } from "ui/routes/definition";
import { OrganizationType } from "graphql/server-types.gen";
import {
  Grid,
  Typography,
  makeStyles,
  Toolbar,
  AppBar,
  Button,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { GoLiveDialog } from "./components/go-live-dialog";
import { ShowErrors } from "ui/components/error-helpers";
import { useSnackbar } from "hooks/use-snackbar";

type Props = {};

export const OrganizationStatusBar: React.FC<Props> = props => {
  const params = useRouteParams(AdminChromeRoute);
  const classes = useStyles();
  const toolbarClasses = useToolbarClasses();
  const { t } = useTranslation();
  const { openSnackbar } = useSnackbar();

  const [liveDialogIsOpen, setLiveDialogIsOpen] = React.useState(false);

  const currentOrgStatus = useQueryBundle(GetOrganization, {
    variables: { id: params.organizationId },
    fetchPolicy: "cache-first",
    skip: !params.organizationId,
  });

  const [goLive] = useMutationBundle(GoLive, {
    onError: error => ShowErrors(error, openSnackbar),
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
      <GoLiveDialog
        orgName={currentOrgStatus.data.organization.byId.name}
        isOpen={liveDialogIsOpen}
        hasValidData={!!currentOrgStatus.data.organization?.byId}
        onCancel={() => setLiveDialogIsOpen(false)}
        onConfirm={async () => {
          if (!currentOrgStatus.data.organization?.byId) {
            setLiveDialogIsOpen(false);
            return;
          }
          await goLive({
            variables: {
              orgId: params.organizationId,
              rowVersion: currentOrgStatus.data.organization.byId.rowVersion,
            },
          });
          setLiveDialogIsOpen(false);
        }}
      />
      <AppBar position="sticky" className={classes.topBar}>
        <Toolbar classes={toolbarClasses}>
          <Grid container alignItems="center" justify="space-between">
            <div>
              <Grid container alignItems="center" justify="space-between">
                <Typography className={classes.orgName}>
                  {currentOrgStatus.data.organization.byId.name}&nbsp;
                </Typography>
                <Typography className={classes.text}>{`${t(
                  "is currently in"
                )} ${
                  currentOrgStatus.data.organization.byId.config
                    .organizationTypeId
                } ${t("mode")}`}</Typography>
              </Grid>
            </div>
            <Button
              variant="contained"
              onClick={() => setLiveDialogIsOpen(true)}
            >
              Go Live
            </Button>
          </Grid>
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
