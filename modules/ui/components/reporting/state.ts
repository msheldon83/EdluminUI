import { Reducer } from "react";
import { OrderByField, ReportDefinition, DataSourceField } from "./types";

export type ReportState = {
  reportDefinition?: ReportDefinition;
  filters: {
    field: DataSourceField;
    value?: any;
  }[];
  orderBy?: OrderByField;
  pendingUpdates?: boolean;
};

export type ReportActions =
  | {
      action: "setReportDefinition";
      reportDefinition: ReportDefinition;
      filterFieldsOverride?: string[];
    }
  | {
      action: "setFilter";
      field: DataSourceField;
      value: any;
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

      return {
        ...prev,
        reportDefinition: action.reportDefinition,
        pendingUpdates: false,
        filters: filterableFields.map(f => {
          return {
            field: f,
          };
        }),
      };
    }
    case "setFilter": {
      const filters = prev.filters.filter(
        f => f.field.dataSourceFieldName !== action.field.dataSourceFieldName
      );

      return {
        ...prev,
        filters: [
          ...filters,
          {
            field: action.field,
            value: action.value,
          },
        ],
        pendingUpdates: true,
      };
    }
    case "setOrderBy": {
      return {
        ...prev,
        orderBy: action.field,
      };
    }
  }
};
