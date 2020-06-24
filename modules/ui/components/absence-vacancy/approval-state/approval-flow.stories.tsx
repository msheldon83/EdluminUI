import * as React from "react";
import { WorkflowSummary } from "./approval-flow";

export default {
  title: "Components/Approval Flow",
};

export const SingleStep = () => {
  return (
    <WorkflowSummary
      steps={singleStep}
      currentStepId={"3"}
      workflowName={"Test workflow"}
    />
  );
};

export const FourStep = () => {
  return (
    <WorkflowSummary
      steps={fourSteps}
      currentStepId={"4"}
      workflowName={"Test workflow"}
    />
  );
};

const singleStep = [
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
    approverGroupHeader: {
      name: "Building approvers with a long name",
    },
    onApproval: [{ goto: "2", criteria: null }],
  },
];

const fourSteps = [
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
    approverGroupHeader: {
      name: "Building approvers with a long name",
    },
    onApproval: [{ goto: "4", criteria: null }],
  },
  {
    stepId: "4",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1001",
    approverGroupHeader: {
      name: "Larry Foxx",
    },
    onApproval: [{ goto: "5", criteria: null }],
  },
  {
    stepId: "5",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1002",
    approverGroupHeader: {
      name: "HR Office",
    },
    onApproval: [{ goto: "6", criteria: null }],
  },
  {
    stepId: "6",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1003",
    approverGroupHeader: {
      name: "Superintendent",
    },
    onApproval: [{ goto: "2", criteria: null }],
  },
];
