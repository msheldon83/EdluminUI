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
        expressionFunction: ExpressionFunction.Equal,
        value: today,
      },
    ],
    orderBy: [
      {
        expression: "(Concat(SubFirstName,' ',SubLastName))",
        direction: Direction.Asc,
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
      <Report input={reportInput} filterFieldsOverride={filterFieldsOverride} />
    </>
  );
};
