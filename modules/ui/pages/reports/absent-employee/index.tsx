import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Report } from "ui/components/reporting";
import { useOrganizationId } from "core/org-context";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
} from "ui/components/reporting/types";

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
    filter: ["Date > '3/1/2020'"],
    orderBy: [
      {
        expression: "Date",
        direction: Direction.Desc,
      },
    ],
  };

  const filterFieldsOverride = [
    "Date",
    "LocationId",
    "AbsenceReasonId",
    "VacancyReasonId",
    "EmployeeId",
    "PositionTypeId",
    "IsAbsence",
    "IsVacancy",
  ];

  return (
    <>
      <PageTitle title={t("Absent Employee")} />
      <Report
        input={reportInput}
        orgIds={[organizationId?.toString() ?? ""]}
        filterFieldsOverride={filterFieldsOverride}
      />
    </>
  );
};
