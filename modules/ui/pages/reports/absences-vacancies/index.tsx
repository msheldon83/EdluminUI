import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
  ExpressionFunction,
} from "ui/components/reporting/types";
import { addDays } from "date-fns";

export const AbsencesVacanciesReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  const reportInput: ReportDefinitionInput = {
    from: "AbsenceAndVacancy",
    select: [
      "ConfirmationNumber",
      "Date",
      "LocationName",
      "Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee",
      "AbsStartTime",
      "AbsEndTime",
      "ReasonName",
      "Concat(SubFirstName,' ',SubLastName) AS Substitute",
      "SubStartTime",
      "SubEndTime",
      "PayDays",
      "PayHours",
      "Title",
      "PositionTypeName",
      "RequiresSub",
      "IsFilled",
    ],
    filter: [
      {
        fieldName: "Date",
        expressionFunction: ExpressionFunction.Between,
        value: [addDays(new Date(), -7), new Date()],
        isRequired: true,
      },
    ],
    orderBy: [
      {
        expression: "Date",
        direction: Direction.Desc,
      },
    ],
  };

  const filterFieldsOverride = [
    "Date",
    "AbsentEmployeeId",
    "SubEmployeeId",
    "PositionTypeId",
    "LocationId",
    "AbsenceReasonId",
    "VacancyReasonId",
    "IsAbsence",
    "IsVacancy",
  ];

  return (
    <>
      <PageTitle title={t("Absences & Vacancies")} />
      <Report
        input={reportInput}
        exportFilename={t("AbsencesVacanciesReport")}
        filterFieldsOverride={filterFieldsOverride}
      />
    </>
  );
};
