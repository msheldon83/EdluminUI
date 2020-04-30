import { useQueryBundle } from "graphql/hooks";
import { GetWorkDayPatterns } from "./get-work-day-patterns.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";

export function useWorkDayPatterns(orgId?: string) {
  const getWorkDayPatterns = useQueryBundle(GetWorkDayPatterns, {
    fetchPolicy: "cache-first",
    variables: { orgId },
    skip: !orgId,
  });

  return useMemo(() => {
    if (
      getWorkDayPatterns.state === "DONE" &&
      getWorkDayPatterns?.data?.workDayPattern?.all
    ) {
      return compact(getWorkDayPatterns?.data?.workDayPattern?.all) ?? [];
    }
    return [];
  }, [getWorkDayPatterns]);
}

export function useWorkDayPatternOptions(orgId?: string) {
  const patterns = useWorkDayPatterns(orgId);

  return useMemo(
    () =>
      patterns.map(p => ({
        label: p.name,
        value: p.id,
      })),
    [patterns]
  );
}
