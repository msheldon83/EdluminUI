import * as React from "react";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { useQueryBundle } from "graphql/hooks";
import { GetApprovalWorkflows } from "../graphql/get-approval-workflows.gen";

type Props = {
  type: ApprovalWorkflowType;
  orgId: string;
};

export const ApprovalWorkflowList: React.FC<Props> = props => {
  const getApprovalWorkflows = useQueryBundle(GetApprovalWorkflows, {
    variables: {
      orgId: props.orgId,
      workFlowType: props.type,
    },
  });

  return <></>;
};
