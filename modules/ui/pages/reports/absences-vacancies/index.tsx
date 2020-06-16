import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";
import { AbsVacLink } from "ui/components/links/abs-vac";

export const AbsencesVacanciesReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const startDate = React.useMemo(
    () => format(addDays(new Date(), -6), "MM/dd/yyyy"),
    []
  );
  const endDate = React.useMemo(() => format(new Date(), "MM/dd/yyyy"), []);

  return (
    <Report
      title={t("Absences & Vacancies")}
      rdl={`QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}') SELECT ConfirmationNumber WIDTH(150), Date, LocationName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee WIDTH(300), AbsentEmployeeExternalId, AbsStartTime, AbsEndTime, ReasonName, Concat(SubFirstName,' ',SubLastName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, Title, PositionTypeName, RequiresSub WIDTH(150), IsFilled, NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Date DESC CHART STACKEDBAR [CountIf(FillStatus = 'Filled', If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS 'Filled' COLOR('#3d4ed7'), CountIf(FillStatus = 'Unfilled', If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS 'Unfilled' COLOR('#FF5555'), CountIf(Equal(FillStatus, 'NoSubRequired'), If(Equal(IsAbsence, 1), AbsenceDetailId, VacancyDetailId)) AS 'No Sub Required' COLOR('#ffcc01')] AGAINST Date`}
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
        dataColumnIndexMap[index]?.displayName == "Confirmation Number"
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
    />
  );
};
