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
        "ConfirmationNumber",
        "Date",
        "LocationName",
        "Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee",
        "AbsentEmployeeExternalId",
        "AbsStartTime",
        "AbsEndTime",
        "ReasonName",
        "Concat(SubFirstName,' ',SubLastName) AS Substitute",
        "SubExternalId",
        "SubStartTime",
        "SubEndTime",
        "PayDays",
        "PayHours",
        "Title",
        "PositionTypeName",
        "RequiresSub",
        "IsFilled",
        "NotesToAdmin",
        "AdminOnlyNotes",
        "NotesToReplacement",
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
      chart: {
        graphs: [
          {
            type: GraphType.StackedBar,
            series: [
              "Count(ConfirmationNumber) AS Absences",
              "Sum(IsFilled) As Filled",
            ],
          },
          {
            type: GraphType.Line,
            series: ["Sum(IsFilled) As 'Filled (Line)'"],
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
        "AbsentEmployeeId",
        "SubEmployeeId",
        "PositionTypeId",
        "LocationId",
        "AbsenceReasonId",
        "VacancyReasonId",
        "IsAbsence",
        "IsVacancy",
      ]}
    />
  );
};
