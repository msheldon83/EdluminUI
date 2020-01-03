import { useQueryBundle } from "graphql/hooks";
import { GetOrgConfigVacancyDayConversions } from "./get-org-config-vacancy-day-conversions.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";

export function useOrgVacancyDayConversions(orgId: string) {
  const getVacancyDayConversions = useQueryBundle(
    GetOrgConfigVacancyDayConversions,
    {
      fetchPolicy: "cache-first",
      variables: { orgId },
    }
  );

  return useMemo(() => {
    if (
      getVacancyDayConversions.state === "DONE" &&
      getVacancyDayConversions.data.organization?.byId?.config
        ?.vacancyDayConversions
    ) {
      return (
        compact(
          getVacancyDayConversions.data.organization?.byId.config
            .vacancyDayConversions
        ) ?? []
      );
    }
    return [];
  }, [getVacancyDayConversions]);
}
