import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetCalendarChangeReasons } from "./get-calendar-change-reasons.gen";
import { useMemo } from "react";

export function useCalendarChangeReasons(
  orgId?: string,
  includeExpired?: boolean
) {
  const reasons = useQueryBundle(GetCalendarChangeReasons, {
    fetchPolicy: "cache-first",
    variables: { orgId, includeExpired: includeExpired ?? false },
    skip: !orgId,
  });

  return useMemo(() => {
    if (reasons.state === "DONE" && reasons.data?.orgRef_CalendarChangeReason) {
      return compact(reasons.data.orgRef_CalendarChangeReason.all) ?? [];
    }
    return [];
  }, [reasons]);
}

export function useCalendarChangeReasonOptions(
  orgId?: string,
  includeExpired?: boolean
) {
  const reasons = useCalendarChangeReasons(orgId, includeExpired);

  return useMemo(
    () =>
      reasons.map(c => ({
        label: c.name,
        value: c.id,
      })),
    [reasons]
  );
}
