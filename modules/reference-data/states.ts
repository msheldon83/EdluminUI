import { useQueryBundle } from "graphql/hooks";
import { GetStates } from "./get-states.gen";
import { useMemo } from "react";
import { StateCode } from "graphql/server-types.gen";

export function useStates() {
  const states = useQueryBundle(GetStates, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (states.state === "DONE" && states.data.referenceData) {
      return states.data.referenceData.states ?? [];
    }
    return [];
  }, [states]);
}

export const USStates: { enumValue: StateCode; name: string }[] = [
  { enumValue: "AL" as StateCode, name: "Alabama" },
  { enumValue: "AK" as StateCode, name: "Alaska" },
  { enumValue: "AZ" as StateCode, name: "Arizona" },
  { enumValue: "AR" as StateCode, name: "Arkansas" },
  { enumValue: "CA" as StateCode, name: "California" },
  { enumValue: "CO" as StateCode, name: "Colorado" },
  { enumValue: "CT" as StateCode, name: "Connecticut" },
  { enumValue: "DE" as StateCode, name: "Delaware" },
  { enumValue: "FL" as StateCode, name: "Florida" },
  { enumValue: "GA" as StateCode, name: "Georgia" },
  { enumValue: "HI" as StateCode, name: "Hawaii" },
  { enumValue: "ID" as StateCode, name: "Idaho" },
  { enumValue: "IL" as StateCode, name: "Illinois" },
  { enumValue: "IN" as StateCode, name: "Indiana" },
  { enumValue: "IA" as StateCode, name: "Iowa" },
  { enumValue: "KS" as StateCode, name: "Kansas" },
  { enumValue: "KY" as StateCode, name: "Kentucky" },
  { enumValue: "LA" as StateCode, name: "Louisiana" },
  { enumValue: "ME" as StateCode, name: "Maine" },
  { enumValue: "MD" as StateCode, name: "Maryland" },
  { enumValue: "MA" as StateCode, name: "Massachusetts" },
  { enumValue: "MI" as StateCode, name: "Michigan" },
  { enumValue: "MN" as StateCode, name: "Minnesota" },
  { enumValue: "MS" as StateCode, name: "Mississippi" },
  { enumValue: "MO" as StateCode, name: "Missouri" },
  { enumValue: "MT" as StateCode, name: "Montana" },
  { enumValue: "NE" as StateCode, name: "Nebraksa" },
  { enumValue: "NV" as StateCode, name: "Nevada" },
  { enumValue: "NH" as StateCode, name: "New Hampshire" },
  { enumValue: "NJ" as StateCode, name: "New Jersey" },
  { enumValue: "NM" as StateCode, name: "New Mexico" },
  { enumValue: "NY" as StateCode, name: "New York" },
  { enumValue: "NC" as StateCode, name: "North Carolina" },
  { enumValue: "ND" as StateCode, name: "North Dakota" },
  { enumValue: "OH" as StateCode, name: "Ohio" },
  { enumValue: "OK" as StateCode, name: "Oklahoma" },
  { enumValue: "OR" as StateCode, name: "Oregon" },
  { enumValue: "PA" as StateCode, name: "Pennsylvania" },
  { enumValue: "RI" as StateCode, name: "Rhode Island" },
  { enumValue: "SC" as StateCode, name: "South Carolina" },
  { enumValue: "SD" as StateCode, name: "South Dakota" },
  { enumValue: "TN" as StateCode, name: "Tennessee" },
  { enumValue: "TX" as StateCode, name: "Texas" },
  { enumValue: "UT" as StateCode, name: "Utah" },
  { enumValue: "VT" as StateCode, name: "Vermont" },
  { enumValue: "VA" as StateCode, name: "Virginia" },
  { enumValue: "WA" as StateCode, name: "Washington" },
  { enumValue: "WV" as StateCode, name: "West Virginia" },
  { enumValue: "WI" as StateCode, name: "Wisconsin" },
  { enumValue: "WY" as StateCode, name: "Wyoming" },
];
