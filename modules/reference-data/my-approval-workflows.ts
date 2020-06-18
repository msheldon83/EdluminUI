import { GetMyApprovalWorkflows } from "./get-my-approval-workflows.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { useMemo } from "react";

export const useMyApprovalWorkflows = () => {
  const approvalWorkflows = useQueryBundle(GetMyApprovalWorkflows, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (
      approvalWorkflows.state === "DONE" &&
      approvalWorkflows.data.approvalWorkflow
    ) {
      return (
        compact(approvalWorkflows.data.approvalWorkflow.myApprovalWorkflows) ??
        []
      );
    }
    return [];
  }, [approvalWorkflows]);
};
