import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowStep,
  Maybe,
  ApprovalWorkflowTransitionInput,
  ApprovalWorkflowType,
} from "graphql/server-types.gen";

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
  }
  if (type === ApprovalWorkflowType.Vacancy) {
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
  }
};

export const convertTransitionToInput = (
  transition: AbsenceTransition | VacancyTransition
) => {
  return {
    goto: transition.goto,
    criteria: JSON.stringify(transition.criteria),
    args: JSON.stringify(transition.args),
  } as ApprovalWorkflowTransitionInput;
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
