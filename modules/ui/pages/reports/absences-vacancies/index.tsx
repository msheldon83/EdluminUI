import * as React from "react";
import { PageTitle } from "ui/components/page-title";
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
            type: GraphType.Bar,
            series: [
              "Count(ConfirmationNumber) AS NumberOfAbsences",
              "Sum(IsFilled) As Test",
            ],
          },
        ],
        againstExpression: "Date",
      },
    };
  }, []);

  return (
    <>
      <PageTitle title={t("Absences & Vacancies")} />
      <Report
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
    </>
  );
};
