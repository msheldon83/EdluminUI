import * as React from "react";
import { useQueryParams } from "hooks/query-params";
import { PermissionEnum } from "graphql/server-types.gen";
import { FilterField } from "ui/components/reporting/types";
import { Report } from "ui/components/reporting";
import { useTranslation } from "react-i18next";
import {
  EmployeeBalanceReportRoute,
  PeopleEmployeeBalancesEditRoute,
} from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { subDays, format, parseISO } from "date-fns";
import { AbsVacLink } from "ui/components/links/abs-vac";
import { useCurrentSchoolYear } from "reference-data/current-school-year";
import { BaseLink, pickUrl } from "ui/components/links/base";

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
    <>
      <BaseLink
        permissions={[PermissionEnum.EmployeeSave]}
        to={pickUrl(PeopleEmployeeBalancesEditRoute.generate(params))}
      >
        {`${t("Return to time off balances")}`}
      </BaseLink>
      <Report
        title={t("Employee balance report")}
        rdl={`QUERY FROM AbsenceAndVacancy WHERE (Date BETWEEN '${startDate}' AND '${endDate}' AND AbsentEmployeeId = '${params.orgUserId}' AND AbsenceReasonId = '${reasonId}') SELECT ConfirmationNumber WIDTH(150), Date, LocationName, Concat(AbsentEmployeeFirstName,' ',AbsentEmployeeLastName) AS Employee WIDTH(300), AbsentEmployeeExternalId, AbsStartTime, AbsEndTime, ReasonName, Concat(SubFirstName,' ',SubLastName) AS Substitute, SubExternalId, SubStartTime WIDTH(150), SubEndTime WIDTH(150), PayDays, PayHours, Title, PositionTypeName, RequiresSub WIDTH(150), IsFilled, NotesToAdmin, AdminOnlyNotes, NotesToReplacement ORDER BY Date DESC`}
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
        customRender={(dataColumnIndexMap, index) =>
          dataColumnIndexMap[index]?.dataSourceField?.dataSourceFieldName ==
          "ConfirmationNumber"
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
                    <AbsVacLink
                      absVacId={value.slice(1)}
                      absVacType="absence"
                    />
                  </div>
                );
              }
            : undefined
        }
      />
    </>
  );
};
