import { ApprovalWorkflowStepInput } from "graphql/server-types.gen";
import {
  GraphView, // required
  Edge, // optional
  Node, // optional
  BwdlTransformer, // optional, Example JSON transformer
  GraphUtils, // optional, useful utility functions
  IEdge,
  INode,
} from "react-digraph";

export const convertStepsToNodes: INode[] = (steps: ApprovalWorkflowStepInput[]) => {
  return steps.map(x => ({id: x.stepId, title: "determine title", type: "determine type"}));
};

export const convertStepsToEdges: IEdge[] = (steps: ApprovalWorkflowStepInput[]) => {
  // Map over steps and create an array of {stepId, goto}
  
  return steps.map(x => )
};
