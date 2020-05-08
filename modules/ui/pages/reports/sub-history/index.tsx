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

export const SubstituteHistoryReport: React.FC<{}> = () => {
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
      "SubStartTime",
      "SubEndTime",
      "PayDays",
      "PayHours",
      "Title",
      "PositionTypeName",
      "RequiresSub",
    ],
    filter: [
      {
        fieldName: "Date",
        expressionFunction: ExpressionFunction.Between,
        value: [addDays(new Date(), -7), new Date()],
        isRequired: true,
      },
      {
        fieldName: "IsFilled",
        expressionFunction: ExpressionFunction.Equal,
        value: true,
        isRequired: true,
      },
    ],
    orderBy: [
      {
        expression: "Concat(SubFirstName,' ',SubLastName)",
        direction: Direction.Asc,
      },
      {
        expression: "Date",
        direction: Direction.Desc,
      },
    ],
    subtotalBy: [
      {
        expression: "SubEmployeeId",
        showExpression: "Concat(SubFirstName,' ',SubLastName) AS Substitute",
      },
    ],
  };

  const filterFieldsOverride = [
    "Date",
    "LocationId",
    "SubEmployeeId",
    "IsAbsence",
    "IsVacancy",
    "PositionTypeId",
  ];

  return (
    <>
      <PageTitle title={t("Substitute History")} />
      <Report
        input={reportInput}
        exportFilename={t("SubstituteHistoryReport")}
        filterFieldsOverride={filterFieldsOverride}
        showGroupLabels={false}
      />
    </>
  );
};
