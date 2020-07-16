import * as React from "react";
import { useState, useMemo } from "react";
import { GraphView, INode, IEdge } from "react-digraph";
import {
  ApprovalWorkflowStepInput,
  ApprovalWorkflowTransitionInput,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { makeStyles, Popper, Fade, ClickAwayListener } from "@material-ui/core";
import { GraphConfig, NODE_KEY } from "./graph-config";
import {
  convertStepsToNodes,
  convertStepsToEdges,
  getNextId,
} from "./graph-helpers";
import { AddUpdateApprover } from "./approver-popper";
import { useApproverGroups } from "ui/components/domain-selects/approver-group-select/approver-groups";
import { breakLabel } from "./text-helper";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useVacancyReasons } from "reference-data/vacancy-reasons";
import { ConditionPopper } from "./condition-popper";

type Props = {
  steps: ApprovalWorkflowStepInput[];
  orgId: string;
  workflowType: ApprovalWorkflowType;
  setSteps: (steps: ApprovalWorkflowStepInput[]) => void;
};

export const StepsGraph: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { steps, setSteps, workflowType } = props;

  const absenceReasons = useAbsenceReasons(props.orgId);
  const vacancyReasons = useVacancyReasons(props.orgId);

  const [elAnchor, setElAnchor] = useState<null | HTMLElement>(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [approverOpen, setApproverOpen] = useState(false);

  const [selectedEdge, setSelectedEdge] = useState<IEdge | undefined>(
    undefined
  );
  const [selectedNode, setSelectedNode] = useState<INode | null>(null);
  const [selectedStep, setSelectedStep] = useState<
    ApprovalWorkflowStepInput | null | undefined
  >(null);

  const approverGroups = useApproverGroups(props.orgId);

  const nodes = useMemo(() => convertStepsToNodes(steps, approverGroups, t), [
    approverGroups,
    steps,
    t,
  ]);
  const edges = useMemo(
    () =>
      convertStepsToEdges(
        steps,
        approverGroups.map(x => x.id)
      ),
    [steps, approverGroups]
  );

  const selected = {};

  const NodeTypes = GraphConfig.NodeTypes;
  const NodeSubtypes = GraphConfig.NodeSubtypes;
  const EdgeTypes = GraphConfig.EdgeTypes;

  const onSelectNode = (node: INode | null) => {
    if (node && node.type !== "end") {
      const nodeId = `node-${node.id}-container`;
      const nodeElement = document.getElementById(nodeId);
      setElAnchor(nodeElement);
      setSelectedNode(node);
      setApproverOpen(true);
      const step = steps.find(x => x.stepId == node.id);
      setSelectedStep(step);
    }
  };

  const onUpdateNode = (node: INode) => {
    const stepIndex = steps.findIndex(x => x.stepId == node.id);
    steps[stepIndex].xPosition = node.x;
    steps[stepIndex].yPosition = node.y;
  };

  const onSelectEdge = (edge: IEdge) => {
    const edgeId = `edge-${edge.source}-${edge.target}-container`;
    const edgeElement = document.getElementById(edgeId);
    setElAnchor(edgeElement);
    if (edge.type === "addEdge") {
      setSelectedEdge(edge);
      setApproverOpen(true);
    } else if (edge.type === "ifEdge") {
      setSelectedEdge(edge);
      setSelectedStep(steps.find(x => x.stepId === edge.source));
      setConditionOpen(true);
    }
  };

  const renderNodeText = (
    data: any,
    id: string | number,
    isSelected: boolean
  ) => {
    if (data.title === "Start" || data.title === "Approved") {
      return (
        <text textAnchor="middle" fill="#FFFFFF" className={classes.whiteText}>
          {data.title}
        </text>
      );
    } else {
      const label = breakLabel(data.title, 25);
      return (
        <text
          y={
            label.length === 1
              ? "0"
              : label.length === 2
              ? "-10"
              : label.length === 3
              ? "-15"
              : "-20"
          }
          className={classes.approverGroupText}
        >
          {label.map((word, index) => (
            <tspan
              dy={index > 0 ? "20" : "0"}
              key={index}
              textAnchor={"middle"}
              x={"0"}
            >
              {word}
            </tspan>
          ))}
        </text>
      );
    }
  };

  const afterRenderEdge = (
    id: string,
    element: any,
    edge: IEdge,
    edgeContainer: any,
    isEdgeSelected: boolean
  ) => {
    // This is to override the styles for the line
    if (edgeContainer.querySelector(".edge")) {
      edgeContainer
        .querySelector(".edge")
        .classList.replace("edge", classes.customEdge);
    }
  };

  const handleAddApprover = (
    groupId: string,
    onApproval: ApprovalWorkflowTransitionInput[]
  ) => {
    const nextId = getNextId(steps);
    const sourceIndex = steps.findIndex(x => x.stepId == selectedEdge?.source);
    const sourceStep = steps[sourceIndex];
    const targetIndex = steps.findIndex(x => x.stepId == selectedEdge?.target);
    const targetStep = steps[targetIndex];

    steps.push({
      stepId: nextId,
      approverGroupHeaderId: groupId,
      isFirstStep: false,
      isLastStep: false,
      deleted: false,
      onApproval: onApproval,
      yPosition: sourceStep.yPosition,
      xPosition:
        (sourceStep.xPosition as number) +
        (targetStep.xPosition - sourceStep.xPosition) / 2,
    });
  };

  const handleUpdateApprover = (
    onApproval: ApprovalWorkflowTransitionInput[],
    stepId?: string,
    groupId?: string
  ) => {
    if (!stepId && groupId) {
      handleAddApprover(groupId, onApproval);
    } else {
      const stepIndex = steps.findIndex(x => x.stepId == stepId);
      steps[stepIndex].approverGroupHeaderId = groupId ?? null;
      steps[stepIndex].onApproval = onApproval;
    }

    handleClosePopper();
  };

  const handleUpdateCondition = (
    stepId: string,
    transition: ApprovalWorkflowTransitionInput
  ) => {
    const stepIndex = steps.findIndex(x => x.stepId == stepId);
    const onApprovalIndex = steps[stepIndex].onApproval.findIndex(
      x => x.goto == selectedEdge?.target
    );
    if (onApprovalIndex >= 0) {
      steps[stepIndex].onApproval[onApprovalIndex] = transition;
    } else {
      steps[stepIndex].onApproval.unshift(transition);
    }

    handleClosePopper();
  };

  const handleClosePopper = () => {
    setElAnchor(null);
    setSelectedNode(null);
    setConditionOpen(false);
    setApproverOpen(false);
    setSelectedEdge(undefined);
    setSelectedStep(null);
  };

  const handleRemoveStep = () => {
    if (selectedStep) {
      const stepIndex = steps.findIndex(x => x.stepId === selectedStep.stepId);
      steps[stepIndex].deleted = true;
      const defaultGoto = steps[stepIndex].onApproval.find(x => !x.criteria)
        ?.goto;

      steps
        .filter(
          x =>
            !x.deleted &&
            x.onApproval.find(x => !x.criteria)?.goto === selectedStep.stepId
        )
        .forEach(x => {
          const defaultTransition = x.onApproval.find(x => !x.criteria);
          if (defaultTransition) {
            defaultTransition.goto = defaultGoto;
          }
        });

      handleClosePopper();
    }
  };

  return (
    <div className={classes.graphBox}>
      <GraphView
        nodeKey={NODE_KEY}
        nodes={nodes}
        edges={edges}
        selected={selected}
        nodeTypes={NodeTypes}
        nodeSubtypes={NodeSubtypes}
        edgeTypes={EdgeTypes}
        onSelectNode={onSelectNode}
        onUpdateNode={onUpdateNode}
        onSelectEdge={onSelectEdge}
        showGraphControls={true}
        renderNodeText={renderNodeText}
        afterRenderEdge={afterRenderEdge}
        // The following functions are required props, but we aren't implementing them
        onCreateNode={() => {}}
        onDeleteNode={() => {}}
        onCreateEdge={() => {}}
        onDeleteEdge={() => {}}
        onSwapEdge={() => {}}
      />
      <Popper
        transition
        open={approverOpen}
        anchorEl={elAnchor}
        placement="top"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <ClickAwayListener
              mouseEvent="onMouseDown"
              onClickAway={() => {
                handleClosePopper();
              }}
            >
              <>
                <AddUpdateApprover
                  workflowType={workflowType}
                  orgId={props.orgId}
                  onClose={() => handleClosePopper()}
                  onSave={handleUpdateApprover}
                  steps={steps}
                  approverGroups={approverGroups}
                  myStep={selectedStep}
                  defaultGotoStepId={selectedEdge?.target ?? ""}
                  onRemove={selectedStep ? handleRemoveStep : undefined}
                  reasons={
                    workflowType === ApprovalWorkflowType.Absence
                      ? absenceReasons
                      : workflowType === ApprovalWorkflowType.Vacancy
                      ? vacancyReasons
                      : []
                  }
                />
              </>
            </ClickAwayListener>
          </Fade>
        )}
      </Popper>
      <Popper
        transition
        open={conditionOpen}
        anchorEl={elAnchor}
        placement="top"
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={150}>
            <ClickAwayListener
              mouseEvent="onMouseDown"
              onClickAway={() => {
                handleClosePopper();
              }}
            >
              <>
                <ConditionPopper
                  workflowType={workflowType}
                  orgId={props.orgId}
                  onClose={() => handleClosePopper()}
                  onSave={handleUpdateCondition}
                  steps={steps}
                  myStep={selectedStep}
                  gotoStepId={selectedEdge?.target}
                />
              </>
            </ClickAwayListener>
          </Fade>
        )}
      </Popper>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  graphBox: {
    width: "100%",
    height: "600px",
  },
  whiteText: {
    color: theme.customColors.white,
    fontWeight: 500,
    fontSize: theme.typography.pxToRem(24),
  },
  approverGroupText: {
    color: theme.customColors.black,
    fontSize: theme.typography.pxToRem(20),
    wordWrap: "break-word",
  },
  customEdge: {
    stroke: theme.customColors.black,
    strokeWidth: "1px",
    color: theme.customColors.white,
    cursor: "pointer",
  },
}));
