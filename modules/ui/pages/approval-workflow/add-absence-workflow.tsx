import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { AbsenceApprovalWorkflowAddRoute } from "ui/routes/approval-workflow";
import { ApprovalWorkflowAdd } from "./components/create/add";

export const AbsenceApprovalWorkflowAdd: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceApprovalWorkflowAddRoute);

  return (
    <ApprovalWorkflowAdd
      workflowType={ApprovalWorkflowType.Absence}
      orgId={params.organizationId}
    />
  );
};
