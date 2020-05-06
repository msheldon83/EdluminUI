import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
  ExpressionFunction,
} from "ui/components/reporting/types";

export const SubstituteHistoryReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const today = React.useMemo(() => new Date(), []);

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
        expressionFunction: ExpressionFunction.Equal,
        value: today,
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
        filterFieldsOverride={filterFieldsOverride}
        showGroupLabels={false}
      />
    </>
  );
};
