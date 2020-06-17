export type ApprovalWorkflowSteps = {
  stepId: string;
  deleted: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  approverGroupHeaderId?: string | null;
  approverGroupHeader?: {
    name: string;
  } | null;
  onApproval: {
    goto?: string | null;
    criteria?: string | null;
  }[];
};
