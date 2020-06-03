import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";

export const SubstituteHistoryReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  const startDate = React.useMemo(
    () => format(addDays(new Date(), -6), "MM/dd/yyyy"),
    []
  );
  const endDate = React.useMemo(() => format(new Date(), "MM/dd/yyyy"), []);

  return (
    <Report
      title={t("Substitute History")}
      rdl={`QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}') AND (IsFilled = '1') SELECT ConfirmationNumber, SubExternalId, Date, LocationName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee, AbsStartTime, AbsEndTime, ReasonName, SubStartTime, SubEndTime, PayDays, PayHours, Title, PositionTypeName, RequiresSub, NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Concat(SubFirstName,' ',SubLastName) ASC, Date DESC WITH SUBTOTALS SubEmployeeId SHOW Concat(SubFirstName,' ',SubLastName) AS Substitute`}
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
    />
  );
};
