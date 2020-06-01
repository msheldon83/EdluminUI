import * as React from "react";

export const NODE_KEY = "id"; // Allows D3 to correctly update DOM

export const GraphConfig: any = {
  NodeTypes: {
    start: {
      // required to show empty nodes
      typeText: "Start",
      shapeId: "#start", // relates to the type property of a node
      shape: (
        <symbol
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="start"
          key="0"
        >
          <circle cx="80" cy="80" r="80" fill="#050039" />
        </symbol>
      ),
    },
    approverGroup: {
      // required to show empty nodes
      typeText: "Approver",
      shapeId: "#approverGroup", // relates to the type property of a node
      shape: (
        <symbol
          width="200"
          height="80"
          viewBox="0 0 200 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="approverGroup"
          key="0"
        >
          <rect height="80" width="200" fill="#FFFFFF" />
        </symbol>
      ),
    },
    end: {
      // required to show empty nodes
      typeText: "Approved",
      shapeId: "#end", // relates to the type property of a node
      shape: (
        <symbol
          width="160"
          height="160"
          viewBox="0 0 160 160"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="end"
          key="0"
        >
          <circle cx="80" cy="80" r="80" fill="#4CC17C" />
        </symbol>
      ),
    },
  },
  NodeSubtypes: {},
  EdgeTypes: {
    emptyEdge: {
      // Edge for no more approver groups to select
      shapeId: "#emptyEdge",
      shape: <symbol viewBox="0 0 0 0" id="emptyEdge" key="0" />,
    },
    addEdge: {
      // Edge to include and add groups button
      shapeId: "#addEdge",
      shape: (
        <symbol viewBox="0 0 30 30" id="addEdge" key="0">
          <g id="add">
            <circle cx="15" cy="15" r="15" fill="#FF5555" />
            <rect height="20" width="4" x="13" y="5" fill="#FFFFFF" />
            <rect height="4" width="20" x="5" y="13" fill="#FFFFFF" />
          </g>
        </symbol>
      ),
    },
  },
};
