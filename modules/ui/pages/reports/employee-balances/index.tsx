import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { useOrganizationId } from "core/org-context";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import {
  getRdlFromLocalStorage,
  saveRdlToLocalStorage,
} from "ui/components/reporting/helpers";

export const EmployeeBalancesReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const orgId = useOrganizationId();
  const currentSchoolYear = useCurrentSchoolYear(orgId ?? undefined);

  // TODO: Once we have Saved Views, the need for this localStorage piece
  // goes away. The localStorageKey has the Date in it on the off chance
  // we need to come into here and modify the canned report RDL prior to
  // implementing Saved Views and want to make sure all Users default back
  // to the RDL that we define the next time they visit this report.
  const localStorageKey = React.useMemo(
    () => `AbsenceReasonBalancesReport_20200618_${orgId}`,
    [orgId]
  );
  const rdl = React.useMemo(() => {
    const localStorageRdl = getRdlFromLocalStorage(localStorageKey);
    if (localStorageRdl) {
      return localStorageRdl;
    }

    return `QUERY FROM EmployeeBalances WHERE (SchoolYearId = ${currentSchoolYear?.id}) SELECT BalanceName, NetBalance, AbsenceReasonUsageUnit, SchoolYearName, AbsenceReasonName, AbsenceReasonCategoryName, InitialBalance, UsedBalance, UnusedBalance, Identifier AS 'Employee Identifier', Title, PositionTypeName, LocationNames ORDER BY Concat(LastName, ', ', FirstName) ASC WITH SUBTOTALS OrgUserId SHOW Concat(LastName, ', ', FirstName) AS Employee`;
  }, [currentSchoolYear?.id, localStorageKey]);

  if (!currentSchoolYear) {
    return <></>;
  }

  return (
    <Report
      title={t("Absence Reason Balances")}
      rdl={rdl}
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
      saveRdl={(rdl: string) => saveRdlToLocalStorage(localStorageKey, rdl)}
    />
  );
};
