import * as React from "react";
import { useState } from "react";
import { ApprovalWorkflowStepInput, ApprovalWorkflowType } from "graphql/server-types.gen";

type Props = {
  workflowType: ApprovalWorkflowType;
  approverGroups: { id: string; name: string }[];
  reasons: {
    id: string;
    name: string;
  }[];
  step: ApprovalWorkflowStepInput;
  steps: ApprovalWorkflowStepInput[];
  onChange: (step: ApprovalWorkflowStepInput) => void;
};

export const AbsVacTransitions: React.FC<Props> = props => {
  const [transitions, setTransitions] = useState<

};