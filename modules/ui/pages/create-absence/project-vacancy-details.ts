import { HookQueryResult } from "graphql/hooks";
import { GetProjectedAbsenceUsageQueryVariables } from "./graphql/get-projected-absence-usage.gen";
import { GetProjectedVacanciesQuery } from "./graphql/get-projected-vacancies.gen";
import { VacancyDetail } from "./types";

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
  if (!vacancies || vacancies.length < 1) {
    return [];
  }
  return (vacancies[0]?.details ?? [])
    .map(d => ({
      date: d?.startDate,
      locationId: d?.locationId,
      startTime: d?.startTimeLocal,
      endTime: d?.endTimeLocal,
    }))
    .filter(
      (detail): detail is VacancyDetail =>
        detail.locationId && detail.date && detail.startTime && detail.endTime
    );
};
