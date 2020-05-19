import * as React from "react";
import { useTranslation } from "react-i18next";
import { Table } from "ui/components/table";
import { makeStyles, Tooltip } from "@material-ui/core";
import { Column } from "material-table";
import { useHistory } from "react-router";
import { Section } from "ui/components/section";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { useQueryBundle } from "graphql/hooks";
import { GetApprovalWorkflows } from "../graphql/get-approval-workflows.gen";
import { useIsMobile } from "hooks";
import { ApprovalWorkflowEditRoute } from "ui/routes/approval-workflow";
import { compact } from "lodash-es";

type Props = {
  type: ApprovalWorkflowType;
  orgId: string;
};

export const ApprovalWorkflowList: React.FC<Props> = props => {
  const { t } = useTranslation();
  const history = useHistory();
  const classes = useStyles();
  const isMobile = useIsMobile();

  const getApprovalWorkflows = useQueryBundle(GetApprovalWorkflows, {
    variables: {
      orgId: props.orgId,
      workFlowType: props.type,
    },
  });

  const workflows =
    getApprovalWorkflows.state === "DONE"
      ? compact(getApprovalWorkflows.data?.approvalWorkflow?.all)
      : [];

  const columns: Column<GetApprovalWorkflows.All>[] = [
    {
      title: t("Name"),
      field: "name",
    },
    {
      title: t("Position Types"),
      render: data => t("None"),
    },
  ];

  return (
    <>
      <Section>
        <Table
          title={`${workflows.length} ${t("Workflows")}`}
          columns={columns}
          data={workflows}
          selection={false}
          onRowClick={(event, workflow) => {
            if (!ApprovalWorkflowType) return;

            history.push(
              ApprovalWorkflowEditRoute.generate({
                approvalWorkflowId: workflow?.id ?? "",
                organizationId: props.orgId,
              })
            );
          }}
        />
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
