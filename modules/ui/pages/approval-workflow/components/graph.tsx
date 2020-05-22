import * as React from "react";
import {
  GraphView, // required
  Edge, // optional
  Node, // optional
  BwdlTransformer, // optional, Example JSON transformer
  GraphUtils, // optional, useful utility functions
  IEdge,
} from "react-digraph";
import { ApprovalWorkflowStepInput } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/core";
import { GraphConfig, NODE_KEY } from "./graph-config";

type Props = {
  steps: ApprovalWorkflowStepInput[];
};

export const StepsGraph: React.FC<Props> = props => {
  const classes = useStyles();

  const nodes = [
    {
      id: 1,
      title: "Start",
      x: 100,
      y: 250,
      type: "start",
    },
    {
      id: 2,
      title: "Approved",
      x: 1000,
      y: 250,
      type: "end",
    },
    {
      id: 3,
      title: "Building Approvers",
      x: 500,
      y: 250,
      type: "approverGroup",
    },
  ];
  const edges = [
    {
      source: 1,
      target: 3,
      type: "emptyEdge",
    },
    {
      source: 3,
      target: 2,
      type: "emptyEdge",
    },
  ];
  const selected = {};

  const NodeTypes = GraphConfig.NodeTypes;
  const NodeSubtypes = GraphConfig.NodeSubtypes;
  const EdgeTypes = GraphConfig.EdgeTypes;

  const onSelectNode = () => {};
  const onCreateNode = () => {};
  const onUpdateNode = () => {};
  const onDeleteNode = () => {};
  const onSelectEdge = () => {};
  const onCreateEdge = () => {};
  const onSwapEdge = () => {};
  const onDeleteEdge = () => {};

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
      return (
        <text textAnchor="middle" className={classes.approverGroupText}>
          {data.title}
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
    edgeContainer
      .querySelector(".edge")
      .classList.replace("edge", classes.customEdge);
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
        onCreateNode={onCreateNode}
        onUpdateNode={onUpdateNode}
        onDeleteNode={onDeleteNode}
        onSelectEdge={onSelectEdge}
        onCreateEdge={onCreateEdge}
        onSwapEdge={onSwapEdge}
        onDeleteEdge={onDeleteEdge}
        showGraphControls={true}
        renderNodeText={renderNodeText}
        afterRenderEdge={afterRenderEdge}
      />
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
  },
  customEdge: {
    stroke: theme.customColors.black,
    strokeWidth: "1px",
    color: theme.customColors.white,
    cursor: "pointer",
  },
}));
