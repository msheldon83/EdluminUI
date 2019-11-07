import { useQueryBundle } from "graphql/hooks";
import { GetTimezones } from "./get-timezones.gen";

export function useTimezones() {
  const timeZones = useQueryBundle(GetTimezones, {
    fetchPolicy: "cache-first",
  });
  if (timeZones.state === "DONE" && timeZones.data.referenceData) {
    return timeZones.data.referenceData.timeZones ?? [];
  }
  return [];
}
