import * as React from "react";
import { useQueryParams } from "hooks/query-params";
import { FilterField } from "ui/components/reporting/types";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import { EmployeeBalanceReportRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { subDays, format, parseISO } from "date-fns";
import { AbsVacLink } from "ui/components/links/abs-vac";
import { useCurrentSchoolYear } from "reference-data/current-school-year";

export const EmployeeBalanceReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const params = useRouteParams(EmployeeBalanceReportRoute);
  const [{ reasonId }] = useQueryParams({ reasonId: "" });
  const currentSchoolYear = useCurrentSchoolYear(params.organizationId);
  const today = React.useMemo(() => new Date(), []);
  const startDate = format(
    currentSchoolYear
      ? parseISO(currentSchoolYear.startDate)
      : subDays(today, 6),
    "MM/dd/yyyy"
  );
  const endDate = format(
    currentSchoolYear ? parseISO(currentSchoolYear.endDate) : today,
    "MM/dd/yyyy"
  );

  return (
    <Report
      title={t("")}
      rdl={`QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}' AND AbsentEmployeeId = '${params.orgUserId}' AND AbsenceReasonId = '${reasonId}') SELECT ConfirmationNumber WIDTH(150), Date, LocationName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee WIDTH(300), AbsentEmployeeExternalId, AbsStartTime, AbsEndTime, ReasonName, Concat(SubFirstName,' ',SubLastName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, Title, PositionTypeName, RequiresSub WIDTH(150), IsFilled, NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Date DESC CHART STACKEDBAR [CountIf(FillStatus = 'Filled', If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS 'Filled' COLOR('#3d4ed7'), CountIf(FillStatus = 'Unfilled', If(IsAbsence=1,AbsenceDetailId,VacancyDetailId)) AS 'Unfilled' COLOR('#FF5555'), CountIf(Equal(FillStatus, 'NoSubRequired'), If(Equal(IsAbsence, 1), AbsenceDetailId, VacancyDetailId)) AS 'No Sub Required' COLOR('#ffcc01')] AGAINST Date`}
      exportFilename={t("AbsencesVacanciesReport")}
      allowedFilterFieldsOverride={[
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
      customRender={index =>
        index == 0
          ? (classes, value) => {
              if (value.startsWith("#V")) {
                return (
                  <div className={classes}>
                    <AbsVacLink
                      absVacId={value.slice(2)}
                      absVacType="vacancy"
                    />
                  </div>
                );
              }
              return (
                <div className={classes}>
                  <AbsVacLink absVacId={value.slice(1)} absVacType="absence" />
                </div>
              );
            }
          : undefined
      }
      chartVisiableAtStart={false}
    />
  );
};
