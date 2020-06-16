import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";
import { AbsVacLink } from "ui/components/links/abs-vac";
import {
  saveRdlToLocalStorage,
  getRdlFromLocalStorage,
} from "ui/components/reporting/helpers";

export const AbsencesVacanciesReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const startDate = React.useMemo(
    () => format(addDays(new Date(), -6), "MM/dd/yyyy"),
    []
  );
  const endDate = React.useMemo(() => format(new Date(), "MM/dd/yyyy"), []);

  // TODO: Once we have Saved Views, the need for this localStorage piece
  // goes away. The localStorageKey has the Date in it on the off chance
  // we need to come into here and modify the canned report RDL prior to
  // implementing Saved Views and want to make sure all Users default back
  // to the RDL that we define the next time they visit this report.
  const localStorageKey = "AbsencesAndVacanciesReport_20200611";
  const rdl = React.useMemo(() => {
    const localStorageRdl = getRdlFromLocalStorage(localStorageKey);
    if (localStorageRdl) {
      return localStorageRdl;
    }

    return `QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}') SELECT ConfirmationNumber WIDTH(150), Date WIDTH(150), LocationName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee WIDTH(300), AbsentEmployeeExternalId, AbsStartTime, AbsEndTime, ReasonName, Concat(SubFirstName,' ',SubLastName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, Title, PositionTypeName, RequiresSub WIDTH(150), IsFilled, NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Date DESC CHART STACKEDBAR [CountIf(FillStatus = 'Filled', If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS 'Filled' COLOR('#3d4ed7'), CountIf(FillStatus = 'Unfilled', If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS 'Unfilled' COLOR('#FF5555'), CountIf(Equal(FillStatus, 'NoSubRequired'), If(Equal(IsAbsence, 1), AbsenceDetailId, VacancyDetailId)) AS 'No Sub Required' COLOR('#ffcc01')] AGAINST Date`;
  }, []);

  return (
    <Report
      title={t("Absences & Vacancies")}
      rdl={rdl}
      exportFilename={t("AbsencesVacanciesReport")}
      allowedFilterFieldsOverride={[
        "Date",
        "LocationId",
        "PositionTypeId",
        "AbsentEmployeeId",
        "SubEmployeeId",
        "IsFilled",
        "RequiresSub",
        "AbsenceReasonId",
        "VacancyReasonId",
        "IsAbsence",
        "IsVacancy",
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
