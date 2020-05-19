import { Grid, Button, makeStyles } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import {
  ApproverGroupAddRoute,
  ApproverGroupsRoute,
} from "ui/routes/approver-groups";
import { Link } from "react-router-dom";
import { useHistory } from "react-router";
import { ApproverGroupsUI } from "./ui";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, DataImportType } from "graphql/server-types.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { useMyUserAccess } from "reference-data/my-user-access";

export const ApproverGroups: React.FC<{}> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const params = useRouteParams(ApproverGroupsRoute);
  const userAccess = useMyUserAccess();

  return (
    <>
      <Grid
        container
        alignItems="flex-start"
        justify="space-between"
        spacing={2}
        className={classes.header}
      >
        <Grid item>
          <PageTitle title={t("Approver Groups")} />
        </Grid>
        <Can do={[PermissionEnum.ApprovalSettingsSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={ApproverGroupAddRoute.generate(params)}
            >
              {t("Add Group")}
            </Button>
            {/* <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.ApprovalGroup}
              label={t("Import groups")}
              className={classes.importButton}
            /> */}
          </Grid>
        </Can>
      </Grid>
      <ApproverGroupsUI />
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
  importButton: {
    marginLeft: theme.spacing(1),
  },
}));
