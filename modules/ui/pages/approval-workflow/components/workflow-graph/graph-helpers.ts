import { ApprovalWorkflowStepInput } from "graphql/server-types.gen";
import i18next = require("i18next");
import { flatMap, compact } from "lodash-es";

export const convertStepsToNodes = (
  steps: ApprovalWorkflowStepInput[],
  approverGroups: { id: string; name: string }[],
  t: i18next.TFunction
) => {
  return compact(
    steps
      .filter(x => !x.deleted)
      .map(step => ({
        id: step.stepId,
        title: determineTitle(step, approverGroups, t),
        type: determineType(step),
        x: step.xPosition,
        y: step.yPosition,
      }))
  );
};

export const convertStepsToEdges = (
  steps: ApprovalWorkflowStepInput[],
  approverGroupIds: string[]
) => {
  const usedIds = compact(
    steps.filter(x => !x.deleted).map(x => x.approverGroupHeaderId)
  );
  const allGroupsUsed = usedIds.length === approverGroupIds.length;

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
          type: allGroupsUsed ? "emptyEdge" : g.criteria ? "ifEdge" : "addEdge",
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

const determineType = (step: ApprovalWorkflowStepInput) => {
  if (step.isFirstStep) return "start";
  if (step.isLastStep) return "end";
  return "approverGroup";
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
