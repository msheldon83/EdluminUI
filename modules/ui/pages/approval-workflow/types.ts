import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowStep,
  Maybe,
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

export type AbsenceTransitionCriteria = {
  absenceReasonIds?: Maybe<string>[] | null;
};

export type VacancyTransitionCriteria = {
  vacancyReasonIds?: Maybe<string>[] | null;
};

export const buildTransitionCriteriaJsonString = (
  criteria?: AbsenceTransitionCriteria | VacancyTransitionCriteria | null
) => {
  return JSON.stringify(criteria);
};

export type AbsenceTransitionArgs = {
  makeAvailableToFill: boolean;
};

export const buildAbsenceTransitionArgsJsonString = (
  args?: AbsenceTransitionArgs | null
) => {
  return JSON.stringify(args);
};

export type VacancyTransitionArgs = {
  makeAvailableToFill: boolean;
};

export const buildVacancyTransitionArgsJsonString = (
  args?: VacancyTransitionArgs | null
) => {
  return JSON.stringify(args);
};

export const buildTransitionArgsJsonString = (
  args?: VacancyTransitionArgs | AbsenceTransitionArgs | null
) => {
  return JSON.stringify(args);
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
