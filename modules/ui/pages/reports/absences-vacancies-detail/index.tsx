import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";

export const AbsencesVacanciesDetailReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const startDate = React.useMemo(
    () => format(addDays(new Date(), -6), "MM/dd/yyyy"),
    []
  );
  const endDate = React.useMemo(() => format(new Date(), "MM/dd/yyyy"), []);

  return (
    <Report
      title={t("Absences & Vacancies - Detail")}
      rdl={`QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}') SELECT ConfirmationNumber WIDTH(150), Date, LocationName, Concat(AbsentEmployeeLastName, ', ', AbsentEmployeeFirstName) AS Employee WIDTH(300), AbsentEmployeeExternalId, AbsStartTime, AbsEndTime, ReasonName, Concat(SubLastName, ', ', SubFirstName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, PayCodeName, PayCodeDescription, AccountingCodeName, AccountingCodeDescription, PositionTypeName, Title, PositionTypeName, RequiresSub WIDTH(150), IsFilled, NotesToAdmin, AdminOnlyNotes, NotesToReplacement, IsVerified, VerifiedAtLocal WIDTH(200), VerifyComments ORDER BY Date DESC`}
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
    />
  );
};
