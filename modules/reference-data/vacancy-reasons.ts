import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetVacancyReasons } from "./get-vacancy-reasons.gen";
import { useMemo } from "react";

export function useVacancyReasons(orgId: string) {
  const vacancyReasons = useQueryBundle(GetVacancyReasons, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (
      vacancyReasons.state === "DONE" &&
      vacancyReasons.data.orgRef_VacancyReason
    ) {
      return compact(vacancyReasons.data.orgRef_VacancyReason.all) ?? [];
    }
    return [];
  }, [vacancyReasons]);
}

export function useVacancyReasonOptions(
  orgId: string,
  additionalOptions?: { label: string; value: string }[]
) {
  const vacancyReasons = useVacancyReasons(orgId);
  const vacancyReasonOptions = useMemo(
    () => vacancyReasons.map(r => ({ label: r.name, value: r.id })),
    [vacancyReasons]
  );
  if (additionalOptions && additionalOptions.length > 0) {
    additionalOptions.forEach(x => {
      if (!vacancyReasonOptions.find(y => y.value === x.value)) {
        vacancyReasonOptions.push(x);
      }
    });
  }
  return vacancyReasonOptions;
}
