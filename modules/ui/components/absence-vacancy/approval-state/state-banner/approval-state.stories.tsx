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
        approvalWorkflowSteps={approvalWorkflowSteps}
        currentStepId={"2"}
        isTrueVacancy={false}
        absenceId={"1000"}
        approvalWorkflowId={"1000"}
        canApprove={true}
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
        approvalWorkflowSteps={approvalWorkflowSteps}
        currentStepId={"3"}
        isTrueVacancy={false}
        absenceId={"1000"}
        approvalWorkflowId={"1000"}
        canApprove={true}
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
        approvalStatusId={ApprovalStatus.PartiallyApproved}
        approvalWorkflowSteps={approvalWorkflowSteps}
        currentStepId={"3"}
        isTrueVacancy={true}
        vacancyId={"1000"}
        approvalWorkflowId={"1000"}
        canApprove={true}
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

const approvalWorkflowSteps = [
  {
    stepId: "1",
    isFirstStep: true,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: null,
    onApproval: [{ goto: "3", criteria: null }],
  },
  {
    stepId: "2",
    isFirstStep: false,
    isLastStep: true,
    deleted: false,
    approverGroupHeaderId: null,
    onApproval: [{ goto: null, criteria: null }],
  },
  {
    stepId: "3",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1000",
    onApproval: [{ goto: "2", criteria: null }],
  },
];
