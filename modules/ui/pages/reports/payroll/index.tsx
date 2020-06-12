import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { addDays, format } from "date-fns";

export const PayrollReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const startDate = React.useMemo(
    () => format(addDays(new Date(), -6), "MM/dd/yyyy"),
    []
  );
  const endDate = React.useMemo(() => format(new Date(), "MM/dd/yyyy"), []);

  return (
    <Report
      title={t("Payroll")}
      rdl={`QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}') AND (IsFilled = '1') SELECT ConfirmationNumber WIDTH(150), Date, IsVerified, VerifiedAtLocal WIDTH(200), LocationName, Concat(SubLastName, ', ', SubFirstName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), ReasonName, PayDays, PayHours, PayCodeName, PayCodeDescription, AccountingCodeName, AccountingCodeDescription, PositionTypeName, VerifyComments, NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Date DESC`}
      baseFilterFieldNames={["IsFilled"]}
      exportFilename={t("Payroll")}
      allowedFilterFieldsOverride={[
        "Date",
        "IsVerified",
        "LocationId",
        "PositionTypeId",
        "SubEmployeeId",
        "AbsenceReasonId",
        "VacancyReasonId",
        "IsAbsence",
        "IsVacancy",
      ]}
    />
  );
};
