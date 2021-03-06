import { useQueryBundle } from "graphql/hooks";
import { GetWorkDayScheduleVariantTypes } from "./get-work-day-schedule-variant-types.gen";
import { compact } from "lodash-es";
import { useMemo } from "react";

export function useWorkDayScheduleVariantTypes(orgId: string) {
  const getWorkDayScheduleVariantTypes = useQueryBundle(
    GetWorkDayScheduleVariantTypes,
    {
      fetchPolicy: "cache-first",
      variables: { orgId },
    }
  );

  return useMemo(() => {
    if (
      getWorkDayScheduleVariantTypes.state === "DONE" &&
      getWorkDayScheduleVariantTypes.data?.orgRef_WorkDayScheduleVariantType
        ?.all
    ) {
      return (
        compact(
          getWorkDayScheduleVariantTypes.data.orgRef_WorkDayScheduleVariantType
            .all
        ) ?? []
      );
    }
    return [];
  }, [getWorkDayScheduleVariantTypes]);
}
