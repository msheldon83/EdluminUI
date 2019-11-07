import { useQueryBundle } from "graphql/hooks";
import { GetWorkDayPatterns } from "./get-work-day-patterns.gen";
import { compact } from "lodash-es";

export function useWorkDayPatterns(orgId: string) {
  const getWorkDayPatterns = useQueryBundle(GetWorkDayPatterns, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  if (getWorkDayPatterns.state === "DONE" && getWorkDayPatterns?.data?.workDayPattern?.all) {
    return compact(getWorkDayPatterns?.data?.workDayPattern?.all) ?? [];
  }
  return [];
}