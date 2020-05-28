import * as React from "react";
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

  const reportInput: ReportDefinitionInput = React.useMemo(() => {
    return {
      from: "AbsenceAndVacancy",
      select: [
        { expression: "ConfirmationNumber" },
        { expression: "SubExternalId" },
        { expression: "Date" },
        { expression: "LocationName" },
        {
          expression:
            "Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee",
        },
        { expression: "AbsStartTime" },
        { expression: "AbsEndTime" },
        { expression: "ReasonName" },
        { expression: "SubStartTime" },
        { expression: "SubEndTime" },
        { expression: "PayDays" },
        { expression: "PayHours" },
        { expression: "Title" },
        { expression: "PositionTypeName" },
        { expression: "RequiresSub" },
        { expression: "NotesToAdmin" },
        { expression: "AdminOnlyNotes" },
        { expression: "NotesToReplacement" },
      ],
      filter: [
        {
          fieldName: "Date",
          expressionFunction: ExpressionFunction.Between,
          value: [addDays(new Date(), -6), new Date()],
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
  }, []);

  return (
    <Report
      title={t("Substitute History")}
      input={reportInput}
      exportFilename={t("SubstituteHistoryReport")}
      showGroupLabels={false}
      filterFieldsOverride={[
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
