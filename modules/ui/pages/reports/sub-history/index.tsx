import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { AbsVacLink } from "ui/components/links/abs-vac";
import {
  saveRdlToLocalStorage,
  getRdlFromLocalStorage,
} from "ui/components/reporting/helpers";
import { useOrganizationId } from "core/org-context";

export const SubstituteHistoryReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const orgId = useOrganizationId();

  // TODO: Once we have Saved Views, the need for this localStorage piece
  // goes away. The localStorageKey has the Date in it on the off chance
  // we need to come into here and modify the canned report RDL prior to
  // implementing Saved Views and want to make sure all Users default back
  // to the RDL that we define the next time they visit this report.
  const localStorageKey = React.useMemo(
    () => `SubHistoryReport_20200618_${orgId}`,
    [orgId]
  );
  const rdl = React.useMemo(() => {
    const localStorageRdl = getRdlFromLocalStorage(localStorageKey);
    if (localStorageRdl) {
      return localStorageRdl;
    }

    return "QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN %-6d AND %0d) AND (IsFilled = '1') SELECT ConfirmationNumber, AssignmentId, SubExternalId, Date WIDTH(150), LocationName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee WIDTH(300), AbsStartTime WIDTH(150), AbsEndTime WIDTH(150), ReasonName, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, Title, PositionTypeName, RequiresSub WIDTH(150), NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Concat(SubFirstName,' ',SubLastName) ASC, Date DESC WITH SUBTOTALS SubEmployeeId SHOW Concat(SubFirstName,' ',SubLastName) AS Substitute";
  }, [localStorageKey]);

  return (
    <Report
      title={t("Substitute History")}
      rdl={rdl}
      baseFilterFieldNames={["IsFilled"]}
      exportFilename={t("SubstituteHistoryReport")}
      showGroupLabels={false}
      allowedFilterFieldsOverride={[
        "Date",
        "SubEmployeeId",
        "LocationId",
        "PositionTypeId",
        "IsAbsence",
        "IsVacancy",
        "SubSourceOrgId",
      ]}
      saveRdl={(rdl: string) => saveRdlToLocalStorage(localStorageKey, rdl)}
      customRender={(dataColumnIndexMap, index) =>
        dataColumnIndexMap[index]?.dataSourceField?.dataSourceFieldName ==
        "ConfirmationNumber"
          ? (classes, value) => {
              if (value.startsWith("#V")) {
                return (
                  <div className={classes}>
                    <AbsVacLink
                      absVacId={value.slice(2)}
                      absVacType="vacancy"
                    />
                  </div>
                );
              }
              return (
                <div className={classes}>
                  <AbsVacLink absVacId={value.slice(1)} absVacType="absence" />
                </div>
              );
            }
          : dataColumnIndexMap[index]?.dataSourceField?.dataSourceFieldName ==
            "AssignmentId"
          ? (classes, value) => <div className={classes}>{`#C${value}`}</div>
          : undefined
      }
    />
  );
};
