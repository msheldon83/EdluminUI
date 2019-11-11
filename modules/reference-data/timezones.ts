import { useQueryBundle } from "graphql/hooks";
import { GetTimezones } from "./get-timezones.gen";
import { useMemo } from "react";

export function useTimezones() {
  const timeZones = useQueryBundle(GetTimezones, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (timeZones.state === "DONE" && timeZones.data.referenceData) {
      return timeZones.data.referenceData.timeZones ?? [];
    }
    return [];
  }, [timeZones]);
}
