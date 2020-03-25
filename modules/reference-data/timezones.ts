import { useQueryBundle } from "graphql/hooks";
import { GetTimezones } from "./get-timezones.gen";
import { useMemo } from "react";
import { compact } from "lodash-es";

export function useTimezones() {
  const timeZones = useQueryBundle(GetTimezones, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (timeZones.state === "DONE" && timeZones.data.referenceData) {
      return compact(timeZones.data.referenceData.timeZones) ?? [];
    }
    return [];
  }, [timeZones]);
}

export function useTimeZoneOptions() {
  const timeZones = useTimezones();

  return useMemo(
    () =>
      timeZones.map(r => ({
        label: r.name,
        value: r.enumValue?.toString() ?? "",
      })),
    [timeZones]
  );
}
