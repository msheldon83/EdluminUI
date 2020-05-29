import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { VacancyApprovalWorkflowAddRoute } from "ui/routes/approval-workflow";
import { ApprovalWorkflowAdd } from "./components/create/add";

export const VacancyApprovalWorkflowAdd: React.FC<{}> = props => {
  const params = useRouteParams(VacancyApprovalWorkflowAddRoute);

  return (
    <ApprovalWorkflowAdd
      workflowType={ApprovalWorkflowType.Vacancy}
      orgId={params.organizationId}
    />
  );
};
