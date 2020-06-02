import * as React from "react";
import { ApprovalState } from "./index";
import { ApprovalStatus } from "graphql/server-types.gen";
import { mockProvider } from "test-helpers/mock-provider";

export default {
  title: "Components/Approval State",
};

export const ApprovedStory = () => {
  return (
    <Provider>
      <ApprovalState
        approvalStateId={"1000"}
        countOfComments={3}
        orgId={"1000"}
        approvalStatusId={ApprovalStatus.Approved}
        approvalWorkflowId={"1000"}
        currentStepId={"2"}
      />
    </Provider>
  );
};

export const DeniedStory = () => {
  return (
    <Provider>
      <ApprovalState
        approvalStateId={"1000"}
        countOfComments={3}
        orgId={"1000"}
        approvalStatusId={ApprovalStatus.Denied}
        approvalWorkflowId={"1000"}
        currentStepId={"3"}
      />
    </Provider>
  );
};

export const PendingStory = () => {
  return (
    <Provider>
      <ApprovalState
        approvalStateId={"1000"}
        countOfComments={3}
        orgId={"1000"}
        approvalStatusId={ApprovalStatus.Pending}
        approvalWorkflowId={"1000"}
        currentStepId={"3"}
      />
    </Provider>
  );
};

const Provider = mockProvider({
  mocks: {
    Query: () => ({
      approverGroup: () => ({
        byId: () => ({
          id: "1000",
          name: "Test Group",
        }),
      }),
      approvalWorkflow: () => ({
        byId: () => ({
          id: "1000",
          steps: [
            {
              stepId: "1",
              isFirstStep: true,
              isLastStep: false,
              approverGroupHeaderId: null,
              onApproval: [{ goto: "3", criteria: null }],
            },
            {
              stepId: "2",
              isFirstStep: false,
              isLastStep: true,
              approverGroupHeaderId: null,
              onApproval: [{ goto: null, criteria: null }],
            },
            {
              stepId: "3",
              isFirstStep: false,
              isLastStep: false,
              approverGroupHeaderId: "1000",
              onApproval: [{ goto: "2", criteria: null }],
            },
          ],
        }),
      }),
    }),
  },
});
