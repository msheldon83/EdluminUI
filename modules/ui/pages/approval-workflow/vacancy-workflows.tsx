import * as React from "react";
import { ApprovalWorkflowList } from "./list";
import { useRouteParams } from "ui/routes/definition";
import { VacancyApprovalWorkflowRoute } from "ui/routes/approval-workflow";
import { ApprovalWorkflowType } from "graphql/server-types.gen";

export const VacancyApprovalWorkflowIndex: React.FC<{}> = props => {
  const params = useRouteParams(VacancyApprovalWorkflowRoute);

  return (
    <ApprovalWorkflowList
      orgId={params.organizationId}
      type={ApprovalWorkflowType.Vacancy}
    />
  );
};
