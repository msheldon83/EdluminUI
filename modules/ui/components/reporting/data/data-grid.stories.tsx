import * as React from "react";
import { DataGrid } from "./data-grid";
import { Query, Direction, Report } from "../types";

export default {
  title: "Reports/Data Grid",
};

export const Basic = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportData={{
          rawData,
          dataColumnIndexMap,
        }}
        report={{
          ...report,
          numberOfLockedColumns: 0,
        }}
        orderedBy={[]}
        setFirstLevelOrderBy={() => {}}
        isLoading={false}
        allFields={[]}
        addColumns={() => {}}
        setColumns={() => {}}
        removeColumn={() => {}}
      />
    </div>
  );
};

export const BasicLoading = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportData={{
          rawData,
          dataColumnIndexMap,
        }}
        report={{
          ...report,
          numberOfLockedColumns: 0,
        }}
        orderedBy={[]}
        setFirstLevelOrderBy={() => {}}
        isLoading={true}
        allFields={[]}
        addColumns={() => {}}
        setColumns={() => {}}
        removeColumn={() => {}}
      />
    </div>
  );
};

export const SingleGrouping = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportData={{
          rawData,
          dataColumnIndexMap,
        }}
        report={{
          ...report,
          subtotalBy: [
            {
              expression: {
                displayName: "School Name",
                expressionAsQueryLanguage: "School",
                baseExpressionAsQueryLanguage: "School",
              },
            },
          ],
          numberOfLockedColumns: 1,
        }}
        orderedBy={[]}
        setFirstLevelOrderBy={() => {}}
        isLoading={false}
        allFields={[]}
        addColumns={() => {}}
        setColumns={() => {}}
        removeColumn={() => {}}
      />
    </div>
  );
};

export const MultipleGroupings = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportData={{
          rawData,
          dataColumnIndexMap,
        }}
        report={{
          ...report,
          subtotalBy: [
            {
              expression: {
                displayName: "Date",
                expressionAsQueryLanguage: "Date",
                baseExpressionAsQueryLanguage: "Date",
              },
            },
            {
              expression: {
                displayName: "School Name",
                expressionAsQueryLanguage: "School",
                baseExpressionAsQueryLanguage: "School",
              },
            },
          ],
          numberOfLockedColumns: 2,
        }}
        orderedBy={[]}
        setFirstLevelOrderBy={() => {}}
        isLoading={false}
        allFields={[]}
        addColumns={() => {}}
        setColumns={() => {}}
        removeColumn={() => {}}
      />
    </div>
  );
};

const rawData: any[][] = [
  [
    "3/10/2020",
    "8:00 AM",
    "4:00 PM",
    8,
    "10:00 AM",
    "3:00 PM",
    5,
    "West Chester Middle School",
    "100284",
    "184656",
  ],
  [
    "9/18/2019",
    "8:30 AM",
    "5:00 PM",
    8.5,
    "10:00 AM",
    "3:00 PM",
    5,
    "Haven Elementary School",
    "100284",
    "184656",
  ],
  [
    "6/15/2020",
    "8:45 AM",
    "5:00 PM",
    8.25,
    "10:00 AM",
    "3:00 PM",
    5,
    "Haven Elementary School",
    "100284",
    "184656",
  ],
  [
    "9/18/2019",
    "8:00 AM",
    "5:00 PM",
    9,
    "10:00 AM",
    "3:00 PM",
    5,
    "Haven Elementary School",
    "100284",
    "184656",
  ],
  [
    "9/18/2019",
    "7:00 AM",
    "5:00 PM",
    10,
    "10:00 AM",
    "3:00 PM",
    5,
    "West Chester Elementary School",
    "100284",
    "184656",
  ],
  [
    "4/24/2020",
    "10:00 AM",
    "5:00 PM",
    7,
    "10:00 AM",
    "3:00 PM",
    5,
    "Haven Elementary School",
    "100284",
    "184656",
  ],
];

const dataColumnIndexMap = {
  "0": {
    displayName: "Date",
    expressionAsQueryLanguage: "Date",
    baseExpressionAsQueryLanguage: "Date",
  },
  "1": {
    displayName: "Absence Start Time",
    expressionAsQueryLanguage: "AbsStartTime",
    baseExpressionAsQueryLanguage: "AbsStartTime",
  },
  "2": {
    displayName: "Absence End Time",
    expressionAsQueryLanguage: "AbsEndTime",
    baseExpressionAsQueryLanguage: "AbsEndTime",
  },
  "3": {
    displayName: "Hours of Absence",
    expressionAsQueryLanguage: "AbsHrs",
    baseExpressionAsQueryLanguage: "AbsHrs",
  },
  "4": {
    displayName: "Substitute Start Time",
    expressionAsQueryLanguage: "SubStartTime",
    baseExpressionAsQueryLanguage: "SubStartTime",
  },
  "5": {
    displayName: "Substitute End Time",
    expressionAsQueryLanguage: "SubEndTime",
    baseExpressionAsQueryLanguage: "SubEndTime",
  },
  "6": {
    displayName: "Hours of Assignment",
    expressionAsQueryLanguage: "AssignHrs",
    baseExpressionAsQueryLanguage: "AssignHrs",
  },
  "7": {
    displayName: "School Name",
    expressionAsQueryLanguage: "School",
    baseExpressionAsQueryLanguage: "School",
  },
  "8": {
    displayName: "Absence Id",
    expressionAsQueryLanguage: "AbsId",
    baseExpressionAsQueryLanguage: "AbsId",
  },
  "9": {
    displayName: "Vacancy Id",
    expressionAsQueryLanguage: "VacId",
    baseExpressionAsQueryLanguage: "VacId",
  },
};

const report: Report = {
  from: "Test",
  selects: [
    {
      displayName: "Date",
      expressionAsQueryLanguage: "Date",
      baseExpressionAsQueryLanguage: "Date",
    },
    {
      displayName: "Absence Start Time",
      expressionAsQueryLanguage: "AbsStartTime",
      baseExpressionAsQueryLanguage: "AbsStartTime",
    },
    {
      displayName: "Absence End Time",
      expressionAsQueryLanguage: "AbsEndTime",
      baseExpressionAsQueryLanguage: "AbsEndTime",
    },
    {
      displayName: "Hours of Absence",
      expressionAsQueryLanguage: "AbsHrs",
      baseExpressionAsQueryLanguage: "AbsHrs",
    },
    {
      displayName: "Substitute Start Time",
      expressionAsQueryLanguage: "SubStartTime",
      baseExpressionAsQueryLanguage: "SubStartTime",
    },
    {
      displayName: "Substitute End Time",
      expressionAsQueryLanguage: "SubEndTime",
      baseExpressionAsQueryLanguage: "SubEndTime",
    },
    {
      displayName: "Hours of Assignment",
      expressionAsQueryLanguage: "AssignHrs",
      baseExpressionAsQueryLanguage: "AssignHrs",
    },
    {
      displayName: "School Name",
      expressionAsQueryLanguage: "School",
      baseExpressionAsQueryLanguage: "School",
    },
    {
      displayName: "Absence Id",
      expressionAsQueryLanguage: "AbsId",
      baseExpressionAsQueryLanguage: "AbsId",
    },
    {
      displayName: "Vacancy Id",
      expressionAsQueryLanguage: "VacId",
      baseExpressionAsQueryLanguage: "VacId",
    },
  ],
  orderBy: [],
  subtotalBy: [],
};
