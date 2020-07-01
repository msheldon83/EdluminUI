import * as React from "react";
import { useMemo } from "react";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { PageTitle } from "ui/components/page-title";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import {
  PermissionEnum,
  ApprovalWorkflowType,
  VacancyApprovalWorkflowUsage,
} from "graphql/server-types.gen";
import {
  VacancyApprovalWorkflowRoute,
  VacancyApprovalWorkflowAddRoute,
} from "ui/routes/approval-workflow";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { useQueryBundle } from "graphql/hooks";
import { GetApprovalWorkflows } from "./graphql/get-approval-workflows.gen";
import { ApprovalWorkflowEditRoute } from "ui/routes/approval-workflow";
import { compact } from "lodash-es";

export const VacancyApprovalWorkflowIndex: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(VacancyApprovalWorkflowRoute);
  const history = useHistory();

  const getApprovalWorkflows = useQueryBundle(GetApprovalWorkflows, {
    variables: {
      orgId: params.organizationId,
      workFlowType: ApprovalWorkflowType.Vacancy,
    },
  });

  let workflows: GetApprovalWorkflows.All[] = [];
  if (
    getApprovalWorkflows.state === "DONE" ||
    getApprovalWorkflows.state === "UPDATING"
  ) {
    const qResults = compact(getApprovalWorkflows.data.approvalWorkflow?.all);
    if (qResults) workflows = qResults;
  }

  const tableData = useMemo(
    () =>
      workflows.map(workflow => ({
        id: workflow.id,
        name: workflow.name,
        allOthers: compact(workflow.usages as VacancyApprovalWorkflowUsage[])[0]
          ?.allOthers,
        positionTypes: compact(
          (workflow.usages as VacancyApprovalWorkflowUsage[]).map(
            x => x.positionType?.name
          )
        )
          .sort((a, b) => a.localeCompare(b))
          .join(", "),
      })),
    [workflows]
  );

  const columns: Column<typeof tableData[0]>[] = [
    {
      title: t("Name"),
      field: "name",
      defaultSort: "asc",
    },
    {
      title: t("Position Types"),
      render: data => {
        if (data.allOthers) return t("All Others");
        if (data.positionTypes.length === 0) return t("None");
        return data.positionTypes;
      },
    },
  ];

  return (
    <>
      <Grid
        container
        alignItems="center"
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
          </Grid>
        </Can>
      </Grid>
      <Section>
        <Table
          title={`${workflows.length} ${
            workflows.length === 1 ? t("Workflow") : t("Workflows")
          }`}
          columns={columns}
          data={tableData}
          selection={false}
          onRowClick={(event, workflow) => {
            history.push(
              ApprovalWorkflowEditRoute.generate({
                approvalWorkflowId: workflow?.id ?? "",
                organizationId: params.organizationId,
              })
            );
          }}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(),
  },
}));
