import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowStep,
} from "graphql/server-types.gen";

export type AbsenceWorkflowUsage = {
  positionTypeId?: string | null;
  employeeId?: string | null;
  allOthers: boolean;
};

export type VacancyWorkflowUsage = {
  positionTypeId?: string;
  allOthers: boolean;
};

export type ApprovalStep = {
  stepId: string;
  approverGroupHeaderId?: string | null;
  onApproval: ApprovalWorkflowTransition[];
};

export type ApprovalWorkflowTransition = {
  goto?: string | null;
  criteria?: AbsenceTransitionCriteria | VacancyTransitionCriteria | null;
  args: AbsenceTransitionArgs | VacancyTransitionArgs;
};

export type AbsenceTransitionCriteria = {};

export type VacancyTransitionCriteria = {};

export type AbsenceTransitionArgs = {};

export type VacancyTransitionArgs = {};

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

export const exampleSteps: ApprovalWorkflowStepInput[] = [
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
    approverGroupHeaderId: "1000",
    isFirstStep: false,
    isLastStep: false,
    deleted: false,
    onApproval: [{ goto: "3", criteria: null, args: null }],
    xPosition: 1000,
    yPosition: 250,
  },
  {
    stepId: "3",
    approverGroupHeaderId: null,
    isFirstStep: false,
    isLastStep: true,
    deleted: false,
    onApproval: [{ goto: null, criteria: null, args: null }],
    xPosition: 2000,
    yPosition: 250,
  },
];

export const buildStepsJsonString = (steps: ApprovalStep[]) => {
  return JSON.stringify(steps);
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
