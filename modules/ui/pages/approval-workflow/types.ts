import { ApprovalWorkflowStepInput } from "graphql/server-types.gen";

export type AbsenceWorkflowUsage = {
  positionTypeId?: string | null;
  employeeId?: string | null;
};

export type VacancyWorkflowUsage = {
  positionTypeId?: string;
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
  positionTypeIds?: string[],
  employeeIds?: string[]
) => {
  const usages: AbsenceWorkflowUsage[] = [];
  if (positionTypeIds)
    positionTypeIds.forEach(x =>
      usages.push({ positionTypeId: x, employeeId: null })
    );

  if (employeeIds)
    employeeIds.forEach(x =>
      usages.push({ positionTypeId: null, employeeId: x })
    );

  return JSON.stringify(usages);
};

export const buildVacancyUsagesJsonString = (positionTypeIds?: string[]) => {
  const usages: VacancyWorkflowUsage[] = [];
  if (positionTypeIds)
    positionTypeIds.forEach(x => usages.push({ positionTypeId: x }));

  return JSON.stringify(usages);
};

export const exampleSteps: ApprovalWorkflowStepInput[] = [
  {
    stepId: "firststepId",
    approverGroupHeaderId: null,
    onApproval: [{ goto: "laststepId", criteria: null, args: null }],
  },
  {
    stepId: "laststepId",
    approverGroupHeaderId: "1000",
    onApproval: [{ goto: null, criteria: null, args: null }],
  },
];

export const buildStepsJsonString = (steps: ApprovalStep[]) => {
  return JSON.stringify(steps);
};
