import * as React from "react";
import { Checkbox } from "@material-ui/core";
import { FilterField, FilterType, ExpressionFunction } from "../../types";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { useOrganizationId } from "core/org-context";
import { DateRangePickerPopover } from "ui/components/form/date-range-picker-popover";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";
import { OrgUserRole } from "graphql/server-types.gen";
import { OrgUserSelect } from "ui/components/domain-selects/org-user-select";
import { useTranslation } from "react-i18next";
import { SelectNew, OptionType } from "ui/components/form/select-new";

type Props = {
  filterField: FilterField;
  updateFilter: (filterField: FilterField) => void;
  showLabel?: boolean;
};

export const Filter: React.FC<Props> = props => {
  const { t } = useTranslation();
  const organizationId = useOrganizationId();
  const { filterField, updateFilter, showLabel } = props;

  const filter = React.useMemo(() => {
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
      case FilterType.Date: {
        const start = filterField.value[0] ?? undefined;
        const end = filterField.value[1] ?? undefined;
        return (
          <DateRangePickerPopover
            startDate={start}
            endDate={end}
            placeholder={t("Select dates")}
            label={showLabel ? filterField.field.friendlyName : undefined}
            onDateRangeSelected={(start, end) => {
              updateFilter({
                field: filterField.field,
                expressionFunction: ExpressionFunction.Between,
                value: [start, end],
              });
            }}
          />
        );
      }
      case FilterType.PredefinedSelection:
        return (
          <SelectNew
            label={showLabel ? filterField.field.friendlyName : undefined}
            value={
              filterField.expressionFunction === ExpressionFunction.ContainedIn
                ? filterField.value ?? []
                : filterField.value && filterField.value[0]
                ? filterField.value[0]
                : { value: "", label: "" }
            }
            multiple={
              filterField.expressionFunction === ExpressionFunction.ContainedIn
            }
            options={
              filterField.field.displayValueMap?.map(v => {
                return { value: v.value, label: v.display };
              }) ?? []
            }
            withResetValue={false}
            onChange={value => {
              const filterValues = value
                ? Array.isArray(value)
                  ? value.map((v: OptionType) => v.value)
                  : [value.value]
                : [];
              console.log(filterValues);
              updateFilter({
                field: filterField.field,
                expressionFunction:
                  filterField.expressionFunction ?? ExpressionFunction.Equal,
                value: filterValues.length > 0 ? filterValues : undefined,
              });
            }}
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
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
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
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
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
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
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
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
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
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
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
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
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
  }, [
    filterField.expressionFunction,
    filterField.field,
    filterField.value,
    organizationId,
    showLabel,
    t,
    updateFilter,
  ]);

  return filter;
};
