import * as React from "react";
import { ApprovalWorkflowList } from "./list";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceApprovalWorkflowRoute } from "ui/routes/approval-workflow";
import { ApprovalWorkflowType } from "graphql/server-types.gen";

export const AbsenceApprovalWorkflowIndex: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceApprovalWorkflowRoute);

  return (
    <ApprovalWorkflowList
      orgId={params.organizationId}
      type={ApprovalWorkflowType.Absence}
    />
  );
};
