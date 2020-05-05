import * as React from "react";
import { Checkbox, makeStyles } from "@material-ui/core";
import { FilterField, FilterType, ExpressionFunction } from "../types";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { useOrganizationId } from "core/org-context";
import { DateRangePickerPopover } from "ui/components/form/date-range-picker-popover";
import { DatePicker } from "ui/components/form/date-picker";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";
import { OrgUserRole } from "graphql/server-types.gen";
import { OrgUserSelect } from "ui/components/domain-selects/org-user-select";

type Props = {
  filterField: FilterField;
  updateFilter: (filterField: FilterField) => void;
  showLabel?: boolean;
};

export const Filter: React.FC<Props> = props => {
  const organizationId = useOrganizationId();
  const { filterField, updateFilter, showLabel } = props;

  switch (filterField.field.filterType) {
    case FilterType.Boolean:
      return (
        <Checkbox
          checked={filterField.value ?? false}
          onChange={(e, checked) =>
            updateFilter({
              field: filterField.field,
              expressionFunction: ExpressionFunction.Equal,
              value: checked,
            })
          }
          color="primary"
        />
      );
    case FilterType.Date:
      const today = new Date();
      //TODO: Replace with DateRangePickerPopover
      //return <DateRangePickerPopover />;
      return (
        <DatePicker
          startDate={filterField.value ?? today}
          onChange={d => {
            updateFilter({
              field: filterField.field,
              expressionFunction: ExpressionFunction.Equal,
              value: d.startDate,
            });
          }}
          startLabel={showLabel ? filterField.field.friendlyName : undefined}
          variant="single-hidden"
        />
      );
    case FilterType.Custom:
      switch (filterField.field.filterTypeDefinition?.key) {
        case "Location":
          return (
            <LocationSelect
              orgId={organizationId ?? undefined}
              setSelectedLocationIds={locationIds => {
                const value = locationIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    filterField.expressionFunction ?? ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedLocationIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
              label={
                showLabel
                  ? filterField.field.filterTypeDefinition?.friendlyName
                  : undefined
              }
            />
          );
        case "PositionType":
          return (
            <PositionTypeSelect
              orgId={organizationId ?? undefined}
              setSelectedPositionTypeIds={positionTypeIds => {
                const value = positionTypeIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    filterField.expressionFunction ?? ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedPositionTypeIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
              label={
                showLabel
                  ? filterField.field.filterTypeDefinition?.friendlyName
                  : undefined
              }
            />
          );
        case "Employee":
          return (
            <OrgUserSelect
              orgId={organizationId ?? ""}
              role={OrgUserRole.Employee}
              setSelectedOrgUserIds={orgUserIds => {
                const value = orgUserIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    filterField.expressionFunction ?? ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedOrgUserIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
              label={
                showLabel
                  ? filterField.field.filterTypeDefinition?.friendlyName
                  : undefined
              }
            />
          );
        case "Substitute":
          return (
            <OrgUserSelect
              orgId={organizationId ?? ""}
              role={OrgUserRole.ReplacementEmployee}
              setSelectedOrgUserIds={orgUserIds => {
                const value = orgUserIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    filterField.expressionFunction ?? ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedOrgUserIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
              label={
                showLabel
                  ? filterField.field.filterTypeDefinition?.friendlyName
                  : undefined
              }
            />
          );
        case "AbsenceReason":
          return (
            <AbsenceReasonSelect
              orgId={organizationId ?? ""}
              setSelectedAbsenceReasonIds={absenceReasonIds => {
                const value = absenceReasonIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    filterField.expressionFunction ?? ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedAbsenceReasonIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
              label={
                showLabel
                  ? filterField.field.filterTypeDefinition?.friendlyName
                  : undefined
              }
            />
          );
        case "VacancyReason":
          return (
            <VacancyReasonSelect
              orgId={organizationId ?? ""}
              setSelectedVacancyReasonIds={vacancyReasonIds => {
                const value = vacancyReasonIds ?? [];
                updateFilter({
                  field: filterField.field,
                  expressionFunction:
                    filterField.expressionFunction ?? ExpressionFunction.Equal,
                  value: value,
                });
              }}
              selectedVacancyReasonIds={filterField.value ?? []}
              multiple={
                filterField.expressionFunction ===
                ExpressionFunction.ContainedIn
              }
              includeAllOption={false}
              key={filterField.expressionFunction}
              label={
                showLabel
                  ? filterField.field.filterTypeDefinition?.friendlyName
                  : undefined
              }
            />
          );
      }
      break;
  }

  return null;
};
