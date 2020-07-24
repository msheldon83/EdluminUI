import * as React from "react";
import { useState, useMemo } from "react";
import { GraphView, INode, IEdge } from "react-digraph";
import { ApprovalWorkflowStepInput } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { makeStyles, Popper, Fade, ClickAwayListener } from "@material-ui/core";
import { GraphConfig, NODE_KEY } from "./graph-config";
import { convertStepsToNodes, convertStepsToEdges } from "./graph-helpers";
import { AddUpdateApprover } from "./components/approver-popper";
import { useApproverGroups } from "ui/components/domain-selects/approver-group-select/approver-groups";
import { breakLabel } from "./text-helper";
import { ApprovalWorkflowType } from "graphql/server-types.gen";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { useVacancyReasons } from "reference-data/vacancy-reasons";
import { ConditionPopper } from "./components/condition-popper";
import { compact, flatMap, cloneDeep } from "lodash-es";

type Props = {
  steps: ApprovalWorkflowStepInput[];
  orgId: string;
  workflowType: ApprovalWorkflowType;
  testReasonId?: string;
};

export const StepsGraph: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { steps, workflowType, testReasonId } = props;

  const absenceReasons = useAbsenceReasons(props.orgId);
  const vacancyReasons = useVacancyReasons(props.orgId);

  const [elAnchor, setElAnchor] = useState<null | HTMLElement>(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [approverOpen, setApproverOpen] = useState(false);

  const [selectedEdge, setSelectedEdge] = useState<IEdge | undefined>(
    undefined
  );

  const [selectedStep, setSelectedStep] = useState<
    ApprovalWorkflowStepInput | null | undefined
  >(null);

  const approverGroups = useApproverGroups(props.orgId);

  const nodes = useMemo(
    () =>
      convertStepsToNodes(workflowType, steps, approverGroups, t, testReasonId),
    [approverGroups, steps, t, testReasonId, workflowType]
  );
  const edges = useMemo(
    () =>
      convertStepsToEdges(
        workflowType,
        steps,
        approverGroups.map(x => x.id),
        testReasonId
      ),
    [workflowType, steps, approverGroups, testReasonId]
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
      const step = steps.find(x => x.stepId == node.id);
      setSelectedStep(step);
      setApproverOpen(true);
    }
  };

  // This is called when we move a node
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

  // This function is necessary to change the text of the node to the name of the approver group
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
      // Since SVG doesn't have the ability to word wrap, we break the name into lines, then figure out the positioning to center the text
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
    // TODO: Figure out how to rerender the edges during testing
    if (edgeContainer.querySelector(".edge")) {
      if (edge.type === "hiddenEmptyEdge") {
        edgeContainer
          .querySelector(".edge")
          .classList.replace("edge", classes.hiddenEdge);
      } else if (edge.type !== "hiddenEmptyEdge" && testReasonId) {
        edgeContainer
          .querySelector(".edge")
          .classList.replace("edge", classes.testEdge);
      } else {
        edgeContainer
          .querySelector(".edge")
          .classList.replace("edge", classes.customEdge);
      }
    }
  };

  const handleUpdateSteps = (modifiedSteps: ApprovalWorkflowStepInput[]) => {
    modifiedSteps.forEach(step => {
      const stepIndex = steps.findIndex(x => x.stepId === step.stepId);
      if (stepIndex === -1) {
        // If this is a new step add it and check to make sure its positioning doesn't overlap another node
        if (
          steps.find(
            x =>
              !x.deleted &&
              x.xPosition === step.xPosition &&
              x.yPosition === step.yPosition
          )
        ) {
          step.yPosition = +step.yPosition - 200;
        }
        steps.push(step);
      } else {
        steps[stepIndex] = step;
      }
    });

    // If removing a criteria caused an orphaned path, remove any orphaned steps
    let allGotos = flatMap(
      compact(
        steps.filter(x => !x.deleted).map(x => x.onApproval.map(y => y.goto))
      )
    );
    let orphanedStep = steps
      .filter(x => !x.deleted)
      .find(x => !allGotos.includes(x.stepId) && !x.isFirstStep);
    while (orphanedStep) {
      allGotos = flatMap(
        compact(
          steps.filter(x => !x.deleted).map(x => x.onApproval.map(y => y.goto))
        )
      );
      orphanedStep = steps
        .filter(x => !x.deleted)
        .find(x => !allGotos.includes(x.stepId) && !x.isFirstStep);
      if (orphanedStep !== undefined) {
        const orphanedStepIndex = steps.findIndex(
          x => x.stepId === orphanedStep?.stepId
        );
        steps[orphanedStepIndex].deleted = true;
      }
    }
  };

  // Order is important here to avoid updating a component that is no longer mounted
  // We are clearing out everything that was selected with the anchor element for the popper being last
  const handleClosePopper = () => {
    setSelectedEdge(undefined);
    setSelectedStep(null);
    setConditionOpen(false);
    setApproverOpen(false);
    setElAnchor(null);
  };

  const handleRemoveStep = () => {
    if (selectedStep) {
      const stepIndex = steps.findIndex(x => x.stepId === selectedStep.stepId);
      steps[stepIndex].deleted = true;
      const defaultGoto = steps[stepIndex].onApproval.find(x => !x.criteria)
        ?.goto;

      // Iterate over all the non-deleted steps and check all transitions to see if the step being removed was referenced
      // and if any transitions referenced the step set their goto to the default goto of the removed step if the default on the step doesn't already equal the default goto
      // otherwise remove the transition and just update the default transition
      steps
        .filter(
          x =>
            !x.deleted && x.onApproval.some(x => x.goto === selectedStep.stepId)
        )
        .forEach(x => {
          for (let i = x.onApproval.length - 1; i >= 0; i--) {
            if (x.onApproval[i].goto === selectedStep.stepId) {
              if (
                i !== x.onApproval.length - 1 &&
                x.onApproval[x.onApproval.length - 1].goto === defaultGoto
              ) {
                x.onApproval.splice(i, 1);
              } else {
                x.onApproval[i].goto = defaultGoto;
              }
            }
          }
        });

      handleClosePopper();
    }
  };

  return (
    <div id="graph" className={classes.graphBox}>
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
                  orgId={props.orgId}
                  workflowType={workflowType}
                  onClose={() => handleClosePopper()}
                  onSave={handleUpdateSteps}
                  onRemove={selectedStep ? handleRemoveStep : undefined}
                  originalSteps={steps}
                  modifiedSteps={cloneDeep(steps)}
                  approverGroups={approverGroups}
                  selectedStep={selectedStep}
                  reasons={
                    workflowType === ApprovalWorkflowType.Absence
                      ? absenceReasons
                      : workflowType === ApprovalWorkflowType.Vacancy
                      ? vacancyReasons
                      : []
                  }
                  previousStepId={selectedEdge?.source}
                  nextStepId={selectedEdge?.target}
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
                  onSave={handleUpdateSteps}
                  steps={cloneDeep(steps)}
                  selectedStepId={selectedStep?.stepId ?? ""}
                  nextStepId={selectedEdge?.target}
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
  hiddenEdge: {
    stroke: "#050039",
    strokeWidth: "1px",
    color: theme.customColors.white,
  },
  testEdge: {
    stroke: theme.customColors.black,
    strokeWidth: "2px",
    color: theme.customColors.white,
    cursor: "pointer",
  },
}));
