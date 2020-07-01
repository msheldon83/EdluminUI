import { HookQueryResult } from "graphql/hooks";
import { GetProjectedAbsenceUsageQueryVariables } from "./graphql/get-projected-absence-usage.gen";
import { GetProjectedVacanciesQuery } from "./graphql/get-projected-vacancies.gen";
import { VacancyDetail } from "../../components/absence/types";
import { Vacancy } from "graphql/server-types.gen";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";

export const projectVacancyDetails = (
  getProjectedVacancies: HookQueryResult<
    GetProjectedVacanciesQuery,
    GetProjectedAbsenceUsageQueryVariables
  >
): VacancyDetail[] => {
  /* cf 2019-11-25
    we don't currently support having multiple AbsenceVacancyInputs on this page.
    as such, this projection can't handle that case
    */
  if (
    !(
      getProjectedVacancies.state === "DONE" ||
      getProjectedVacancies.state === "UPDATING"
    )
  ) {
    return [];
  }
  const vacancies = getProjectedVacancies.data.absence?.projectedVacancies;
  return projectVacancyDetailsFromVacancies(vacancies);
};

export const projectVacancyDetailsFromVacancies = (
  vacancies: Partial<Vacancy | null>[] | null | undefined
) => {
  if (!vacancies || vacancies.length < 1) {
    return [];
  }
  const absenceDetails = vacancies[0]?.absence?.details;
  return (vacancies[0]?.details ?? [])
    .map(d => {
      // Find a matching Absence Detail record if available
      const absenceDetail = absenceDetails?.find(
        ad => ad?.startDate === d?.startDate
      );

      return {
        vacancyDetailId: d?.id,
        date: d?.startDate,
        locationId: d?.locationId,
        startTime: d?.startTimeLocal,
        endTime: d?.endTimeLocal,
        locationName: d?.location?.name,
        absenceStartTime: absenceDetail?.startTimeLocal,
        absenceEndTime: absenceDetail?.endTimeLocal,
        payCodeId: d?.payCodeId,
        accountingCodeAllocations: mapAccountingCodeAllocationsToAccountingCodeValue(
          d?.accountingCodeAllocations?.map(a => {
            return {
              accountingCodeId: a.accountingCodeId,
              accountingCodeName: a.accountingCode?.name,
              allocation: a.allocation,
            };
          })
        ),
        assignmentId: d?.assignment?.id,
        assignmentRowVersion: d?.assignment?.rowVersion,
        assignmentStartDateTime: d?.startTimeLocal,
        assignmentEmployeeId: d?.assignment?.employee?.id,
        assignmentEmployeeFirstName: d?.assignment?.employee?.firstName,
        assignmentEmployeeLastName: d?.assignment?.employee?.lastName,
      } as VacancyDetail;
    })
    .filter(
      (detail): detail is VacancyDetail =>
        !!detail.locationId &&
        !!detail.date &&
        !!detail.startTime &&
        !!detail.endTime
    );
};
