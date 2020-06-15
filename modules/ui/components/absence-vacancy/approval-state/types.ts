export type ApprovalWorkflowSteps = {
  stepId: string;
  deleted: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  approverGroupHeaderId?: string | null;
  onApproval: {
    goto?: string | null;
    criteria?: string | null;
  }[];
};
