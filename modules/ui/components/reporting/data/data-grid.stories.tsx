import * as React from "react";
import { DataGrid } from "./data-grid";
import { Query, Direction } from "../types";

export default {
  title: "Reports/Data Grid",
};

export const Basic = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportDefinition={{
          data: {
            rawData,
            dataColumnIndexMap,
          },
          metadata: {
            query,
            numberOfColumns: query.selects.length,
            numberOfLockedColumns: 0,
          },
        }}
        isLoading={false}
      />
    </div>
  );
};

export const BasicLoading = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportDefinition={{
          data: {
            rawData,
            dataColumnIndexMap,
          },
          metadata: {
            query,
            numberOfColumns: query.selects.length,
            numberOfLockedColumns: 0,
          },
        }}
        isLoading={true}
      />
    </div>
  );
};

export const SingleGrouping = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportDefinition={{
          data: {
            rawData,
            dataColumnIndexMap,
          },
          metadata: {
            query: {
              ...query,
              subtotalBy: [
                {
                  expression: {
                    displayName: "School Name",
                  },
                },
              ],
            },
            numberOfColumns: query.selects.length,
            numberOfLockedColumns: 1,
          },
        }}
        isLoading={false}
      />
    </div>
  );
};

export const MultipleGroupings = () => {
  return (
    <div style={{ height: "500px", width: "1500px" }}>
      <DataGrid
        reportDefinition={{
          data: {
            rawData,
            dataColumnIndexMap,
          },
          metadata: {
            query: {
              ...query,
              subtotalBy: [
                {
                  expression: {
                    displayName: "Date",
                  },
                },
                {
                  expression: {
                    displayName: "School Name",
                  },
                },
              ],
            },
            numberOfColumns: query.selects.length,
            numberOfLockedColumns: 2,
          },
        }}
        isLoading={false}
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
  },
  "1": {
    displayName: "Absence Start Time",
  },
  "2": {
    displayName: "Absence End Time",
  },
  "3": {
    displayName: "Hours of Absence",
  },
  "4": {
    displayName: "Substitute Start Time",
  },
  "5": {
    displayName: "Substitute End Time",
  },
  "6": {
    displayName: "Hours of Assignment",
  },
  "7": {
    displayName: "School Name",
  },
  "8": {
    displayName: "Absence Id",
  },
  "9": {
    displayName: "Vacancy Id",
  },
};

const query: Query = {
  selects: [
    {
      displayName: "Date",
    },
    {
      displayName: "Absence Start Time",
    },
    {
      displayName: "Absence End Time",
    },
    {
      displayName: "Hours of Absence",
    },
    {
      displayName: "Substitute Start Time",
    },
    {
      displayName: "Substitute End Time",
    },
    {
      displayName: "Hours of Assignment",
    },
    {
      displayName: "School Name",
    },
    {
      displayName: "Absence Id",
    },
    {
      displayName: "Vacancy Id",
    },
  ],
  orderBy: [],
  subtotalBy: [],
  schema: {
    name: "test",
    allFields: [],
  },
};
