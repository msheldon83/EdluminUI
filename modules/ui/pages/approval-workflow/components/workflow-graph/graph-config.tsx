import * as React from "react";

export const NODE_KEY = "id"; // Allows D3 to correctly update DOM

// These are the configs that we use to define the various nodes and edges
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
          width="250"
          height="110"
          viewBox="0 0 250 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="approverGroup"
          key="0"
        >
          <rect height="110" width="250" fill="#FFFFFF" />
        </symbol>
      ),
    },
    selectedApproverGroup: {
      // required to show empty nodes
      typeText: "ApproverSelected",
      shapeId: "#selectedApproverGroup", // relates to the type property of a node
      shape: (
        <symbol
          width="250"
          height="110"
          viewBox="0 0 250 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="selectedApproverGroup"
          key="0"
        >
          <rect height="110" width="250" fill="#E6F5ED" stroke="#4CC17C" />
        </symbol>
      ),
    },
    hiddenApproverGroup: {
      // required to show empty nodes
      typeText: "ApproverHidden",
      shapeId: "#hiddenApproverGroup", // relates to the type property of a node
      shape: (
        <symbol
          width="250"
          height="110"
          viewBox="0 0 250 110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          id="hiddenApproverGroup"
          key="0"
        >
          <rect height="110" width="250" fill="#FFFFFF" stroke="#050039" />
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
    hiddenEmptyEdge: {
      // Edge edge that is hidden when testing
      shapeId: "#hiddenEmptyEdge",
      shape: <symbol viewBox="0 0 0 0" id="hiddenEmptyEdge" key="0" />,
    },
    addEdge: {
      // Edge to include and add groups button
      shapeId: "#addEdge",
      shape: (
        <symbol viewBox="0 0 35 35" id="addEdge" key="0">
          <g id="add">
            <circle cx="15" cy="15" r="15" fill="#FF5555" />
            <text
              textAnchor="middle"
              fill="#FFFFFF"
              y="26"
              x="15"
              fontWeight={500}
              fontSize={"35px"}
            >
              {"+"}
            </text>
          </g>
        </symbol>
      ),
    },
    ifEdge: {
      // Edge to include and IF button
      shapeId: "#ifEdge",
      shape: (
        <symbol viewBox="0 0 35 35" id="ifEdge" key="0">
          <g id="if">
            <circle cx="15" cy="15" r="15" fill="#FFCC01" />
            <text
              textAnchor="middle"
              fill="#262c36"
              y="22"
              x="15"
              fontWeight={500}
              fontSize={"20px"}
            >
              {"IF"}
            </text>
          </g>
        </symbol>
      ),
    },
  },
};
