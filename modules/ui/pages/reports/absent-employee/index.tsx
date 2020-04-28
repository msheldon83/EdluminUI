import * as React from "react";
import { PageTitle } from "ui/components/page-title";
import { Report } from "ui/components/reporting";
import { useOrganizationId } from "core/org-context";
import { useTranslation } from "react-i18next";

export const AbsentEmployeeReport: React.FC<{}> = () => {
  const { t } = useTranslation();
  const organizationId = useOrganizationId();

  const rqlString =
    "QUERY FROM AbsenceAndVacancy SELECT OrgId, Date, AbsStartTime AS Start, SubStartTime, LocationId, LocationName, Concat(AbsentEmployeeLastName,'-',Add(1,5,6)) AS Employee, 456 As Test, PositionTypeId, ReasonName, IsAbsence, IsVacancy, AbsenceId, VacancyId, AbsenceDetailId, VacancyDetailId";

  return (
    <>
      <PageTitle title={t("Absent Employee")} />
      <Report rql={rqlString} orgIds={[organizationId?.toString() ?? ""]} />
    </>
  );
};
