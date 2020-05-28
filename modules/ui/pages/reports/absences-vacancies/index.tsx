import * as React from "react";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  ReportDefinitionInput,
  Direction,
  ExpressionFunction,
  GraphType,
} from "ui/components/reporting/types";
import { addDays } from "date-fns";

export const AbsencesVacanciesReport: React.FC<{}> = () => {
  const { t } = useTranslation();

  const reportInput: ReportDefinitionInput = React.useMemo(() => {
    return {
      from: "AbsenceAndVacancy",
      select: [
        { expression: "ConfirmationNumber" },
        { expression: "Date" },
        { expression: "LocationName" },
        {
          expression:
            "If(IsVacancy=1, AbsentEmployeeLastName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName))",
          alias: "Employee",
        },
        { expression: "AbsentEmployeeExternalId" },
        { expression: "AbsStartTime" },
        { expression: "AbsEndTime" },
        { expression: "ReasonName" },
        {
          expression: "Concat(SubFirstName,' ',SubLastName)",
          alias: "Substitute",
        },
        { expression: "SubExternalId" },
        { expression: "SubStartTime" },
        { expression: "SubEndTime" },
        { expression: "PayDays" },
        { expression: "PayHours" },
        { expression: "Title" },
        { expression: "PositionTypeName" },
        { expression: "RequiresSub" },
        { expression: "IsFilled" },
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
      ],
      orderBy: [
        {
          expression: "Date",
          direction: Direction.Desc,
        },
      ],
      chart: {
        graphs: [
          {
            type: GraphType.StackedBar,
            series: [
              'CountIf(FillStatus = "Filled", If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS Filled',
              'CountIf(FillStatus = "Unfilled", If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS Unfilled',
              'CountIf(FillStatus = "NoSubRequired", If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS "No Sub Required"',
            ],
          },
        ],
        againstExpression: "Date",
      },
    };
  }, []);

  return (
    <Report
      title={t("Absences & Vacancies")}
      input={reportInput}
      exportFilename={t("AbsencesVacanciesReport")}
      filterFieldsOverride={[
        "Date",
        "LocationId",
        "PositionTypeId",
        "AbsentEmployeeId",
        "SubEmployeeId",
        "IsFilled",
        "RequiresSub",
        "AbsenceReasonId",
        "VacancyReasonId",
        "IsAbsence",
        "IsVacancy",
      ]}
    />
  );
};
