import * as React from "react";
import { useMemo } from "react";
import { Grid, Button, makeStyles } from "@material-ui/core";
import { Table } from "ui/components/table";
import { Column } from "material-table";
import { useTranslation } from "react-i18next";
import { useRouteParams } from "ui/routes/definition";
import { fullNameSort } from "helpers/full-name-sort";
import { PageTitle } from "ui/components/page-title";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import {
  PermissionEnum,
  ApprovalWorkflowType,
  AbsenceApprovalWorkflowUsage,
} from "graphql/server-types.gen";
import {
  AbsenceApprovalWorkflowRoute,
  AbsenceApprovalWorkflowAddRoute,
} from "ui/routes/approval-workflow";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { useQueryBundle } from "graphql/hooks";
import { GetApprovalWorkflows } from "./graphql/get-approval-workflows.gen";
import { ApprovalWorkflowEditRoute } from "ui/routes/approval-workflow";
import { compact } from "lodash-es";

export const AbsenceApprovalWorkflowIndex: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(AbsenceApprovalWorkflowRoute);
  const history = useHistory();

  const getApprovalWorkflows = useQueryBundle(GetApprovalWorkflows, {
    variables: {
      orgId: params.organizationId,
      workFlowType: ApprovalWorkflowType.Absence,
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
        allOthers: compact(workflow.usages as AbsenceApprovalWorkflowUsage[])[0]
          ?.allOthers,
        positionTypes: compact(
          (workflow.usages as AbsenceApprovalWorkflowUsage[]).map(
            x => x.positionType?.name
          )
        ).join(", "),
        employees: (workflow.usages as AbsenceApprovalWorkflowUsage[])
          .filter((x): x is {
            employee: { firstName?: string; lastName?: string };
          } & AbsenceApprovalWorkflowUsage => Boolean(x?.employee))
          .sort(({ employee: e1 }, { employee: e2 }) => fullNameSort(e1, e2))
          .map(x => `${x.employee.firstName} ${x.employee.lastName}`)
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
    {
      title: t("Employees"),
      render: data => {
        if (data.allOthers) return t("All Others");
        if (data.employees.length === 0) return t("None");
        return data.employees;
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
          <PageTitle title={t("Absence Approval Workflows")} />
        </Grid>
        <Can do={[PermissionEnum.ApprovalSettingsSave]}>
          <Grid item>
            <Button
              variant="contained"
              component={Link}
              to={AbsenceApprovalWorkflowAddRoute.generate(params)}
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
