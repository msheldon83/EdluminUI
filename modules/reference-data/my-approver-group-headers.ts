import { GetMyApproverGroupHeaders } from "./get-my-approver-groups.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { useMemo } from "react";

export const useMyApproverGroupHeaders = () => {
  const approverGroupHeaders = useQueryBundle(GetMyApproverGroupHeaders, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (
      approverGroupHeaders.state === "DONE" &&
      approverGroupHeaders.data.approverGroup
    ) {
      return (
        compact(
          approverGroupHeaders.data.approverGroup.myApproverGroupHeaders
        ) ?? []
      );
    }
    return [];
  }, [approverGroupHeaders]);
};
