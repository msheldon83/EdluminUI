import * as React from "react";
import { Checkbox } from "@material-ui/core";
import { FilterField, FilterType, ExpressionFunction } from "../../../types";
import { PositionTypeSelect } from "ui/components/reference-selects/position-type-select";
import { LocationSelect } from "ui/components/reference-selects/location-select";
import { useOrganizationId } from "core/org-context";
import { DateRangePickerPopover } from "ui/components/form/date-range-picker-popover";
import { AbsenceReasonSelect } from "ui/components/reference-selects/absence-reason-select";
import { VacancyReasonSelect } from "ui/components/reference-selects/vacancy-reason-select";
import { OrgUserRole } from "graphql/server-types.gen";
import { OrgUserSelect } from "ui/components/domain-selects/org-user-select/org-user-select";
import { useTranslation } from "react-i18next";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { EndorsementSelect } from "ui/components/reference-selects/endorsement-select";
import { OrgRelationshipSelect } from "ui/components/reference-selects/org-relationship-select";
import { SchoolYearSelect } from "ui/components/reference-selects/school-year-select";
import { AbsenceReasonCategorySelect } from "ui/components/reference-selects/absence-reason-category-select";
import { DecimalInput } from "ui/components/form/decimal-input";
import { NumberInput } from "ui/components/form/number-input";
import { PayCodeSelect } from "ui/components/reference-selects/pay-code-select";
import { AccountingCodeSelect } from "ui/components/reference-selects/accounting-code-select";
import {
  getDateRangeFromRelativeDates,
  getRelativeDatesFromDateRange,
} from "ui/components/reporting/helpers";

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
      case FilterType.Boolean: {
        const checked =
          filterField.value === "1" || (filterField.value ?? false);
        return (
          <Checkbox
            checked={checked}
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
      }
      case FilterType.Number:
        return (
          <NumberInput
            value={filterField.value ?? ""}
            onChange={value => {
              updateFilter({
                field: filterField.field,
                expressionFunction:
                  filterField.expressionFunction ?? ExpressionFunction.Equal,
                value: value ?? undefined,
              });
            }}
          />
        );
      case FilterType.Decimal:
        return (
          <DecimalInput
            value={filterField.value ?? ""}
            onChange={value => {
              updateFilter({
                field: filterField.field,
                expressionFunction:
                  filterField.expressionFunction ?? ExpressionFunction.Equal,
                value: value ?? undefined,
              });
            }}
          />
        );
      case FilterType.Date: {
        let start = filterField.value
          ? filterField.value[0] ?? undefined
          : undefined;
        let end = filterField.value
          ? filterField.value[1] ?? undefined
          : undefined;

        if (!(start instanceof Date) && !(end instanceof Date)) {
          // Might be relative date strings. Find matching dates
          const dateRange = getDateRangeFromRelativeDates(start, end);
          if (dateRange) {
            start = dateRange[0] ?? start;
            end = dateRange[1] ?? end;
          }
        }

        return (
          <DateRangePickerPopover
            startDate={start}
            endDate={end}
            placeholder={t("Select dates")}
            label={showLabel ? filterField.field.friendlyName : undefined}
            onDateRangeSelected={(start, end) => {
              // Check for potential relative date match
              const relativeDates = getRelativeDatesFromDateRange(start, end);
              const relativeStart = relativeDates
                ? relativeDates[0]
                : undefined;
              const relativeEnd = relativeDates ? relativeDates[1] : undefined;

              updateFilter({
                field: filterField.field,
                expressionFunction: ExpressionFunction.Between,
                value: [relativeStart ?? start, relativeEnd ?? end],
              });
            }}
          />
        );
      }
      case FilterType.PredefinedSelection: {
        const options =
          filterField.field.displayValueMap?.map(v => {
            return { value: v.value, label: v.display };
          }) ?? [];
        const value = options.filter(o =>
          (filterField.value ?? []).includes(o.value)
        );
        return (
          <SelectNew
            label={showLabel ? filterField.field.friendlyName : undefined}
            value={
              filterField.expressionFunction === ExpressionFunction.ContainedIn
                ? value
                : value[0] ?? { value: "", label: "" }
            }
            multiple={
              filterField.expressionFunction === ExpressionFunction.ContainedIn
            }
            options={options}
            withResetValue={false}
            onChange={value => {
              const filterValues = value
                ? Array.isArray(value)
                  ? value.map((v: OptionType) => v.value)
                  : [value.value]
                : [];
              updateFilter({
                field: filterField.field,
                expressionFunction:
                  filterField.expressionFunction ?? ExpressionFunction.Equal,
                value: filterValues.length > 0 ? filterValues : undefined,
              });
            }}
            key={filterField.expressionFunction}
          />
        );
      }
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
          case "SchoolYear":
            return (
              <SchoolYearSelect
                orgId={organizationId ?? ""}
                defaultToCurrentSchoolYear={false}
                setSelectedSchoolYearId={schoolYearId => {
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: schoolYearId,
                  });
                }}
                selectedSchoolYearId={filterField.value}
                key={filterField.expressionFunction}
                showLabel={showLabel ?? false}
                label={filterField.field.filterTypeDefinition?.friendlyName}
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
          case "AbsenceReasonCategory":
            return (
              <AbsenceReasonCategorySelect
                orgId={organizationId ?? ""}
                setSelectedAbsenceReasonCategoryIds={absenceReasonCategoryIds => {
                  const value = absenceReasonCategoryIds ?? [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
                  });
                }}
                selectedAbsenceReasonCategoryIds={filterField.value ?? []}
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
          case "Endorsement":
            return (
              <EndorsementSelect
                orgId={organizationId ?? ""}
                setSelectedEndorsementIds={endorsementIds => {
                  const value = endorsementIds ?? [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
                  });
                }}
                selectedEndorsementIds={filterField.value ?? []}
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
          case "PayCode":
            return (
              <PayCodeSelect
                orgId={organizationId ?? undefined}
                setSelectedPayCodeIds={payCodeIds => {
                  const value = payCodeIds ?? [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
                  });
                }}
                selectedPayCodeIds={filterField.value ?? []}
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
          case "AccountingCode":
            return (
              <AccountingCodeSelect
                orgId={organizationId ?? undefined}
                setSelectedAccountingCodeIds={accountingCodeIds => {
                  const value = accountingCodeIds ?? [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: value.length > 0 ? value : undefined,
                  });
                }}
                selectedAccountingCodeIds={filterField.value ?? []}
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
          case "SourceOrganization":
            return (
              <OrgRelationshipSelect
                orgId={organizationId ?? ""}
                includeAllOption={false}
                selectedOrgId={filterField.value}
                setSelectedOrgId={shadowOrgId => {
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: shadowOrgId,
                  });
                }}
                label={
                  showLabel
                    ? filterField.field.filterTypeDefinition?.friendlyName
                    : undefined
                }
                key={filterField.expressionFunction}
              />
            );
          case "AbsenceReasonTrackingType": {
            const absenceReasonTrackingTypeOptions = [
              {
                label: t("Daily"),
                value: 2,
              },
              {
                label: t("Hourly"),
                value: 1,
              },
            ];
            const value = absenceReasonTrackingTypeOptions.filter(o =>
              (filterField.value ?? []).includes(o.value)
            );
            return (
              <SelectNew
                label={showLabel ? filterField.field.friendlyName : undefined}
                value={
                  filterField.expressionFunction ===
                  ExpressionFunction.ContainedIn
                    ? value
                    : value[0] ?? { value: "", label: "" }
                }
                multiple={
                  filterField.expressionFunction ===
                  ExpressionFunction.ContainedIn
                }
                options={absenceReasonTrackingTypeOptions}
                withResetValue={false}
                onChange={value => {
                  const filterValues = value
                    ? Array.isArray(value)
                      ? value.map((v: OptionType) => v.value)
                      : [value.value]
                    : [];
                  updateFilter({
                    field: filterField.field,
                    expressionFunction:
                      filterField.expressionFunction ??
                      ExpressionFunction.Equal,
                    value: filterValues.length > 0 ? filterValues : undefined,
                  });
                }}
                key={filterField.expressionFunction}
              />
            );
          }
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
