import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Report } from "ui/components/reporting";
import { useOrganizationId } from "core/org-context";
import { useTranslation } from "react-i18next";
import { ReportDefinitionInput } from "ui/components/reporting/types";

export const AbsentEmployeeReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const organizationId = useOrganizationId();

  const reportInput: ReportDefinitionInput = {
    from: "AbsenceAndVacancy",
    select: [
      "Date",
      "AbsStartTime",
      "AbsEndTime",
      "SubStartTime",
      "SubEndTime",
      "LocationName",
      "Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee",
      "Title",
      "PositionTypeName",
      "ReasonName",
      "SubFirstName",
      "SubLastName",
      "RequiresSub",
      "IsFilled",
      "AbsenceId",
      "VacancyId",
    ],
  };

  return (
    <>
      <PageTitle title={t("Absent Employee")} />
      <Report input={reportInput} orgIds={[organizationId?.toString() ?? ""]} />
    </>
  );
};
