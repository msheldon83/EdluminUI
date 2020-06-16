import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { useOrganizationId } from "core/org-context";
import { useCurrentSchoolYear } from "reference-data/current-school-year";

export const EmployeeBalancesReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const organizationId = useOrganizationId();
  const currentSchoolYear = useCurrentSchoolYear(organizationId ?? undefined);

  if (!currentSchoolYear) {
    return <></>;
  }

  return (
    <Report
      title={t("Absence Reason Balances")}
      rdl={`QUERY FROM EmployeeBalances WHERE (SchoolYearId = ${currentSchoolYear.id}) SELECT BalanceName, NetBalance, AbsenceReasonUsageUnit, SchoolYearName, AbsenceReasonName, AbsenceReasonCategoryName, InitialBalance, UsedBalance, UnusedBalance, Identifier AS 'Employee Identifier', Title, PositionTypeName, LocationNames ORDER BY Concat(LastName, ', ', FirstName) ASC WITH SUBTOTALS OrgUserId SHOW Concat(LastName, ', ', FirstName) AS Employee`}
      exportFilename={t("AbsenceReasonBalancesReport")}
      allowedFilterFieldsOverride={[
        "SchoolYearId",
        "OrgUserId",
        "AbsenceReasonId",
        "AbsenceReasonCategoryId",
        "IsNegativeBalance",
        "NetBalance",
        "AbsenceReasonUsageUnit",
        "UsedBalance",
        "UnusedBalance",
        "InitialBalance",
        "PositionTypeId",
        "LocationId",
        "Active",
      ]}
      showGroupLabels={false}
      sumRowData={false}
    />
  );
};
