import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import i18next = require("i18next");
import { flatMap, compact } from "lodash-es";
import {
  determinePathThroughAbsVacWorkflow,
  reasonsInCriteria,
} from "../../types";

export const convertStepsToNodes = (
  workflowType: ApprovalWorkflowType,
  steps: ApprovalWorkflowStepInput[],
  approverGroups: { id: string; name: string }[],
  t: i18next.TFunction,
  reasonId?: string
) => {
  const pathThroughWorkflow = reasonId
    ? determinePathThroughAbsVacWorkflow(steps, workflowType, [reasonId])
    : steps;

  return compact(
    steps
      .filter(x => !x.deleted)
      .map(step => ({
        id: step.stepId,
        title: determineTitle(step, approverGroups, t),
        type: determineNodeType(step, pathThroughWorkflow, reasonId),
        x: step.xPosition,
        y: step.yPosition,
      }))
  );
};

export const convertStepsToEdges = (
  workflowType: ApprovalWorkflowType,
  steps: ApprovalWorkflowStepInput[],
  approverGroupIds: string[],
  reasonId?: string
) => {
  const usedIds = compact(
    steps.filter(x => !x.deleted).map(x => x.approverGroupHeaderId)
  );
  const allGroupsUsed = usedIds.length === approverGroupIds.length;

  const pathThroughWorkflow = reasonId
    ? determinePathThroughAbsVacWorkflow(steps, workflowType, [reasonId])
    : steps;

  // If step is deleted, goto the next step in the workflow
  return compact(
    flatMap(
      steps
        .filter(x => !x.deleted)
        .map(step =>
          step.onApproval?.map(oa => ({
            stepId: step.stepId,
            goto: oa.goto,
            criteria: oa.criteria,
          }))
        )
    ).map(g => {
      if (g?.goto && g?.stepId) {
        return {
          source: g.stepId,
          target: g.goto,
          type: determineEdgeType(
            allGroupsUsed,
            g.stepId,
            g.goto,
            pathThroughWorkflow,
            g.criteria,
            reasonId
          ),
        };
      }
    })
  );
};

const determineTitle = (
  step: ApprovalWorkflowStepInput,
  approverGroups: { id: string; name: string }[],
  t: i18next.TFunction
) => {
  if (step.isFirstStep) return t("Start");
  if (step.isLastStep) return t("Approved");
  return approverGroups.find(x => x.id === step.approverGroupHeaderId)?.name;
};

const determineNodeType = (
  step: ApprovalWorkflowStepInput,
  path: ApprovalWorkflowStepInput[],
  reasonId?: string
) => {
  if (step.isFirstStep) return "start";
  if (step.isLastStep) return "end";

  if (reasonId)
    return path.find(x => x.stepId === step.stepId)
      ? "selectedApproverGroup"
      : "hiddenApproverGroup";

  return "approverGroup";
};

const determineEdgeType = (
  allGroupsUsed: boolean,
  sourceStepId: string,
  targetStepId: string,
  path: ApprovalWorkflowStepInput[],
  criteria?: string | null,
  reasonId?: string
) => {
  if (reasonId) {
    const sourceStepIndex = path.findIndex(x => x.stepId === sourceStepId);
    const targetStepIndex = path.findIndex(x => x.stepId === targetStepId);

    if (
      sourceStepIndex >= 0 &&
      targetStepIndex >= 0 &&
      targetStepIndex === sourceStepIndex + 1
    ) {
      if (criteria) {
        return "ifEdge";
      } else if (allGroupsUsed) {
        return "emptyEdge";
      } else {
        return "addEdge";
      }
    } else {
      return "hiddenEmptyEdge";
    }
  }

  if (criteria) {
    return "ifEdge";
  } else if (allGroupsUsed) {
    return "emptyEdge";
  } else {
    return "addEdge";
  }
};

export const getNextId = (steps: ApprovalWorkflowStepInput[]) => {
  const ids = steps.map(s => Number(s.stepId));
  const nextId = Math.max(...ids) + 1;
  return nextId.toString();
};

const findNextNode: any = (
  step: ApprovalWorkflowStepInput,
  steps: ApprovalWorkflowStepInput[]
) => {
  if (!step.deleted) return step;

  const nextStep = steps.find(x => x.stepId === step.onApproval[0].goto);
  return findNextNode(nextStep, steps);
};
