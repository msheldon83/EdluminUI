import { Reducer } from "react";
import {
  OrderByField,
  ReportDefinition,
  DataSourceField,
  ExpressionFunction,
  FilterField,
} from "./types";

export type ReportState = {
  reportDefinition?: ReportDefinition;
  currentFilters: FilterField[];
  filterableFields: DataSourceField[];
  orderBy?: OrderByField;
  pendingUpdates: boolean;
  rdlString?: string;
};

export type ReportActions =
  | {
      action: "setReportDefinition";
      reportDefinition: ReportDefinition;
      filterFieldsOverride?: string[];
    }
  | {
      action: "setFilters";
      filters: FilterField[];
    }
  | {
      action: "setOrderBy";
      field: OrderByField;
    };

export const reportReducer: Reducer<ReportState, ReportActions> = (
  prev,
  action
) => {
  switch (action.action) {
    case "setReportDefinition": {
      const allFields = action.reportDefinition.metadata.query.schema.allFields;
      let filterableFields = allFields.filter(f => !!f.filterType);
      // If we have filterFieldsOverride, then filter the list down to the matching ones
      if (
        !!action.filterFieldsOverride &&
        action.filterFieldsOverride.length > 0
      ) {
        filterableFields = filterableFields.filter(f =>
          action.filterFieldsOverride?.includes(f.dataSourceFieldName)
        );
      }

      //TODO: Process the current filters from the Report Definition and put them
      // into the currentFilters array

      return {
        ...prev,
        reportDefinition: action.reportDefinition,
        pendingUpdates: false,
        filterableFields: filterableFields,
      };
    }
    case "setFilters": {
      //TODO: Process and set the rdlString here too

      return {
        ...prev,
        currentFilters: [...action.filters],
        pendingUpdates: true,
      };
    }
    case "setOrderBy": {
      //TODO: Process and set the rdlString here too

      return {
        ...prev,
        orderBy: action.field,
      };
    }
  }
};

//TODO: Function to build the RDL String off of currentFilters: FilterField[]; and orderBy?: OrderByField;
