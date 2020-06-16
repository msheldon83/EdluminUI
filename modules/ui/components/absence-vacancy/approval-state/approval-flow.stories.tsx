import * as React from "react";
import { WorkflowSummary } from "./approval-flow";

export default {
  title: "Components/Approval Flow",
};

export const SingleStep = () => {
  return (
    <WorkflowSummary
      approverGroups={approverGroups}
      steps={singleStep}
      currentStepId={"3"}
    />
  );
};

export const FourStep = () => {
  return (
    <WorkflowSummary
      approverGroups={approverGroups}
      steps={fourSteps}
      currentStepId={"4"}
    />
  );
};

const approverGroups = [
  {
    id: "1000",
    name: "Building approvers with a long name",
  },
  {
    id: "1001",
    name: "Larry Foxx",
  },
  {
    id: "1002",
    name: "HR Office",
  },
  {
    id: "1003",
    name: "Superintendent",
  },
];

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
    onApproval: [{ goto: "4", criteria: null }],
  },
  {
    stepId: "4",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1001",
    onApproval: [{ goto: "5", criteria: null }],
  },
  {
    stepId: "5",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1002",
    onApproval: [{ goto: "6", criteria: null }],
  },
  {
    stepId: "6",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    approverGroupHeaderId: "1003",
    onApproval: [{ goto: "2", criteria: null }],
  },
];
