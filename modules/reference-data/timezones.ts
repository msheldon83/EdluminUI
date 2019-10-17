import { useQueryBundle } from "graphql/hooks";
import { GetTimezones } from "./GetTimezones.gen";

export function useTimezones() {
  const timeZones = useQueryBundle(GetTimezones, {
    fetchPolicy: "cache-first",
  });
  if (timeZones.state === "DONE" && timeZones.data.referenceData) {
    return timeZones.data.referenceData.timeZones;
  }
}
