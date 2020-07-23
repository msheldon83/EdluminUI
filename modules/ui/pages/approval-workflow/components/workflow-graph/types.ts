import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowStep,
  Maybe,
  ApprovalWorkflowTransitionInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";
import { compact } from "lodash-es";
import { cloneDeep } from "lodash-es";

// Transition helpers

export type AbsenceTransitionCriteria = {
  absenceReasonIds?: Maybe<string>[] | null;
};

export type VacancyTransitionCriteria = {
  vacancyReasonIds?: Maybe<string>[] | null;
};

export type AbsenceTransitionArgs = {
  makeAvailableToFill: boolean;
};

export type VacancyTransitionArgs = {
  makeAvailableToFill: boolean;
};

export type AbsenceTransition = {
  goto?: string;
  criteria?: AbsenceTransitionCriteria;
  args?: AbsenceTransitionArgs;
};

export type VacancyTransition = {
  goto?: string;
  criteria?: VacancyTransitionCriteria;
  args?: VacancyTransitionArgs;
};

export const convertTransitionsFromInput = (
  transitions: ApprovalWorkflowTransitionInput[],
  type: ApprovalWorkflowType
) => {
  if (type === ApprovalWorkflowType.Absence) {
    return compact(
      transitions.map(t => convertTransitionFromInput(t, type))
    ) as AbsenceTransition[];
  } else if (type === ApprovalWorkflowType.Vacancy) {
    return compact(
      transitions.map(t => convertTransitionFromInput(t, type))
    ) as VacancyTransition[];
  } else {
    return [] as AbsenceTransition[];
  }
};

export const convertTransitionFromInput = (
  transition: ApprovalWorkflowTransitionInput,
  type: ApprovalWorkflowType
) => {
  if (type === ApprovalWorkflowType.Absence) {
    const parsedCriteria: AbsenceTransitionCriteria = transition.criteria
      ? JSON.parse(transition.criteria)
      : null;
    const parsedArgs: AbsenceTransitionArgs = transition.args
      ? JSON.parse(transition.args)
      : null;
    return {
      goto: transition.goto,
      criteria: parsedCriteria,
      args: parsedArgs,
    } as AbsenceTransition;
  } else if (type === ApprovalWorkflowType.Vacancy) {
    const parsedCriteria: VacancyTransitionCriteria = transition.criteria
      ? JSON.parse(transition.criteria)
      : null;
    const parsedArgs: VacancyTransitionArgs = transition.args
      ? JSON.parse(transition.args)
      : null;
    return {
      goto: transition.goto,
      criteria: parsedCriteria,
      args: parsedArgs,
    } as VacancyTransition;
  } else {
    return {} as AbsenceTransition;
  }
};

export const convertTransitionToInput = (
  transition: AbsenceTransition | VacancyTransition
) => {
  return {
    goto: transition.goto,
    criteria: transition.criteria ? JSON.stringify(transition.criteria) : null,
    args: transition.args ? JSON.stringify(transition.args) : null,
  } as ApprovalWorkflowTransitionInput;
};

export const convertTransitionsToInput = (transitions: any[]) => {
  return transitions.map(tr => convertTransitionToInput(tr));
};

// Usage helpers

export type AbsenceWorkflowUsage = {
  positionTypeId?: string | null;
  employeeId?: string | null;
  allOthers: boolean;
};

export type VacancyWorkflowUsage = {
  positionTypeId?: string;
  allOthers: boolean;
};

export const buildAbsenceUsagesJsonString = (
  allOthers: boolean,
  positionTypeIds?: string[],
  employeeIds?: string[]
) => {
  const usages: AbsenceWorkflowUsage[] = [];
  if (allOthers) {
    usages.push({ allOthers });
  } else {
    if (positionTypeIds)
      positionTypeIds.forEach(x =>
        usages.push({ allOthers, positionTypeId: x, employeeId: null })
      );

    if (employeeIds)
      employeeIds.forEach(x =>
        usages.push({ allOthers, positionTypeId: null, employeeId: x })
      );
  }

  return JSON.stringify(usages);
};

export const buildVacancyUsagesJsonString = (
  allOthers: boolean,
  positionTypeIds?: string[]
) => {
  const usages: VacancyWorkflowUsage[] = [];
  if (allOthers) {
    usages.push({ allOthers });
  } else {
    if (positionTypeIds)
      positionTypeIds.forEach(x =>
        usages.push({ allOthers, positionTypeId: x })
      );
  }

  return JSON.stringify(usages);
};

// Step helpers

export const createNewStep = (
  steps: ApprovalWorkflowStepInput[],
  nextStepId?: string | null,
  previousStepId?: string,
  approverGroupHeaderId?: string,
  additionalSteps?: ApprovalWorkflowStepInput[]
) => {
  const ids = new Set([
    ...steps.map(s => Number(s.stepId)),
    ...(additionalSteps?.map(s => Number(s.stepId)) ?? []),
    Number(previousStepId),
  ]);
  const nextId = Math.max(...ids) + 1;

  const previousStep = steps.find(x => x.stepId === previousStepId);
  const nextStep = steps.find(x => x.stepId === nextStepId);

  return {
    stepId: nextId.toString(),
    approverGroupHeaderId: approverGroupHeaderId ? approverGroupHeaderId : null,
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    onApproval: [{ goto: nextStep?.stepId, criteria: null, args: null }],
    yPosition: previousStep?.yPosition,
    xPosition:
      (previousStep?.xPosition as number) +
      (nextStep?.xPosition - previousStep?.xPosition) / 2,
  } as ApprovalWorkflowStepInput;
};

export const buildCleanStepInput = (steps: ApprovalWorkflowStep[]) => {
  return steps.map(s => ({
    stepId: s.stepId,
    isFirstStep: s.isFirstStep,
    isLastStep: s.isLastStep,
    approverGroupHeaderId: s.approverGroupHeaderId,
    deleted: s.deleted,
    xPosition: s.xPosition,
    yPosition: s.yPosition,
    onApproval: s.onApproval.map(a => ({
      goto: a.goto,
      args: a.args,
      criteria: a.criteria,
    })),
  })) as ApprovalWorkflowStepInput[];
};

export const initialSteps: ApprovalWorkflowStepInput[] = [
  {
    stepId: "1",
    approverGroupHeaderId: null,
    isFirstStep: true,
    isLastStep: false,
    deleted: false,
    onApproval: [{ goto: "2", criteria: null, args: null }],
    xPosition: 100,
    yPosition: 250,
  },
  {
    stepId: "2",
    approverGroupHeaderId: null,
    isFirstStep: false,
    isLastStep: true,
    deleted: false,
    onApproval: [{ goto: null, criteria: null, args: null }],
    xPosition: 2000,
    yPosition: 250,
  },
];

// Path through workflow

export const determinePathThroughAbsVacWorkflow = (
  steps: ApprovalWorkflowStepInput[],
  workflowType: ApprovalWorkflowType,
  reasonIds?: string[],
  upToStep?: ApprovalWorkflowStepInput,
  newSteps?: ApprovalWorkflowStepInput[]
) => {
  const allSteps = cloneDeep(steps);
  if (upToStep && !allSteps.find(s => s.stepId === upToStep.stepId))
    allSteps.push(upToStep);
  if (newSteps) allSteps.concat(newSteps);
  console.log(allSteps);

  const pathSteps = [] as ApprovalWorkflowStepInput[];
  let step = allSteps.filter(x => !x.deleted).find(x => x.isFirstStep);
  pathSteps.push(step!);

  while (step && step.stepId !== upToStep?.stepId) {
    const transitions = convertTransitionsFromInput(
      step.onApproval,
      workflowType
    ) as any[];
    let nextStepId = transitions[transitions.length - 1].goto;

    if (reasonIds && reasonIds.length > 0 && transitions.length > 1) {
      nextStepId = transitions.find((transition: any) => {
        if (transition.criteria) {
          return reasonsInCriteria(
            transition.criteria,
            workflowType,
            reasonIds
          );
        }
        // If we have reached the default transition, then it is in the workflow
        return true;
      })?.goto;
    }

    step = allSteps.find(x => x.stepId === nextStepId);
    if (step) pathSteps.push(step);
  }

  return pathSteps;
};

export const reasonsInCriteria = (
  criteria: any,
  workflowType: ApprovalWorkflowType,
  reasonIds: string[]
) => {
  if (typeof criteria === "string") criteria = JSON.parse(criteria);

  if (workflowType === ApprovalWorkflowType.Absence) {
    const parsedCriteria = criteria as AbsenceTransitionCriteria;
    if (reasonIds.some(r => parsedCriteria.absenceReasonIds?.includes(r))) {
      return true;
    } else {
      return false;
    }
  } else {
    const parsedCriteria = criteria as VacancyTransitionCriteria;
    if (reasonIds.some(r => parsedCriteria.vacancyReasonIds?.includes(r))) {
      return true;
    } else {
      return false;
    }
  }
};
