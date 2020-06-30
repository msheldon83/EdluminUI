import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { AbsVacLink } from "ui/components/links/abs-vac";
import {
  getRdlFromLocalStorage,
  saveRdlToLocalStorage,
} from "ui/components/reporting/helpers";
import { useOrganizationId } from "core/org-context";

export const AbsencesVacanciesDetailReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const orgId = useOrganizationId();

  // TODO: Once we have Saved Views, the need for this localStorage piece
  // goes away. The localStorageKey has the Date in it on the off chance
  // we need to come into here and modify the canned report RDL prior to
  // implementing Saved Views and want to make sure all Users default back
  // to the RDL that we define the next time they visit this report.
  const localStorageKey = React.useMemo(
    () => `AbsencesAndVacanciesDetailReport_20200626_${orgId}`,
    [orgId]
  );
  const rdl = React.useMemo(() => {
    const localStorageRdl = getRdlFromLocalStorage(localStorageKey);
    if (localStorageRdl) {
      return localStorageRdl;
    }

    return "QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN %-6d AND %0d) SELECT ConfirmationNumber WIDTH(150), Date, LocationName, If(IsVacancy = 1, AbsentEmployeeLastName, Concat(AbsentEmployeeLastName, ', ', AbsentEmployeeFirstName)) AS Employee WIDTH(300), AbsentEmployeeExternalId, AbsStartTime, AbsEndTime, ReasonName, Concat(SubLastName, ', ', SubFirstName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, PayCodeName, PayCodeDescription, AccountingCodeName, AccountingCodeDescription, AccountingCodeAllocation, PositionTypeName, Title, PositionTypeName, RequiresSub WIDTH(150), IsFilled, NotesToAdmin, AdminOnlyNotes, NotesToReplacement, IsVerified, VerifiedAtLocal WIDTH(200), VerifyComments ORDER BY Date DESC";
  }, [localStorageKey]);

  return (
    <Report
      title={t("Absences & Vacancies - Detail")}
      rdl={rdl}
      exportFilename={t("AbsencesAndVacanciesDetailReport")}
      allowedFilterFieldsOverride={[
        "Date",
        "IsVerified",
        "LocationId",
        "PositionTypeId",
        "AbsentEmployeeId",
        "SubEmployeeId",
        "AbsenceReasonId",
        "VacancyReasonId",
        "AccountingCodeId",
        "PayCodeId",
        "IsAbsence",
        "IsVacancy",
        "HasNotesToAdmin",
        "HasAdminOnlyNotes",
        "HasNotesToReplacement",
      ]}
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
          : undefined
      }
      saveRdl={(rdl: string) => saveRdlToLocalStorage(localStorageKey, rdl)}
    />
  );
};
