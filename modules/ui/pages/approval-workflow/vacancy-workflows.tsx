import * as React from "react";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { PermissionEnum, ApprovalWorkflowType } from "graphql/server-types.gen";
import { ImportDataButton } from "ui/components/data-import/import-data-button";
import { ApprovalWorkflowList } from "./components/list";
import {
  VacancyApprovalWorkflowRoute,
  VacancyApprovalWorkflowAddRoute,
} from "ui/routes/approval-workflow";

export const VacancyApprovalWorkflowIndex: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VacancyApprovalWorkflowRoute);

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
          <PageTitle title={t("Vacancy Approval Workflows")} />
        </Grid>
        <Can do={[PermissionEnum.ApprovalSettingsSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={VacancyApprovalWorkflowAddRoute.generate(params)}
            >
              {t("Add Workflow")}
            </Button>
            {/* <ImportDataButton
              orgId={params.organizationId}
              importType={DataImportType.ApprovalWorkflow}
              label={t("Import workflow")}
              className={classes.importButton}
            /> */}
          </Grid>
        </Can>
      </Grid>
      <ApprovalWorkflowList
        orgId={params.organizationId}
        type={ApprovalWorkflowType.Vacancy}
      />
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
