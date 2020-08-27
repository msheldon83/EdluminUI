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
  { enumValue: StateCode.Al, name: "Alabama" },
  { enumValue: StateCode.Ak, name: "Alaska" },
  { enumValue: StateCode.Az, name: "Arizona" },
  { enumValue: StateCode.Ar, name: "Arkansas" },
  { enumValue: StateCode.Ca, name: "California" },
  { enumValue: StateCode.Co, name: "Colorado" },
  { enumValue: StateCode.Ct, name: "Connecticut" },
  { enumValue: StateCode.De, name: "Delaware" },
  { enumValue: StateCode.Fl, name: "Florida" },
  { enumValue: StateCode.Ga, name: "Georgia" },
  { enumValue: StateCode.Hi, name: "Hawaii" },
  { enumValue: StateCode.Id, name: "Idaho" },
  { enumValue: StateCode.Il, name: "Illinois" },
  { enumValue: StateCode.In, name: "Indiana" },
  { enumValue: StateCode.Ia, name: "Iowa" },
  { enumValue: StateCode.Ks, name: "Kansas" },
  { enumValue: StateCode.Ky, name: "Kentucky" },
  { enumValue: StateCode.La, name: "Louisiana" },
  { enumValue: StateCode.Me, name: "Maine" },
  { enumValue: StateCode.Md, name: "Maryland" },
  { enumValue: StateCode.Ma, name: "Massachusetts" },
  { enumValue: StateCode.Mi, name: "Michigan" },
  { enumValue: StateCode.Mn, name: "Minnesota" },
  { enumValue: StateCode.Ms, name: "Mississippi" },
  { enumValue: StateCode.Mo, name: "Missouri" },
  { enumValue: StateCode.Mt, name: "Montana" },
  { enumValue: StateCode.Ne, name: "Nebraksa" },
  { enumValue: StateCode.Nv, name: "Nevada" },
  { enumValue: StateCode.Nh, name: "New Hampshire" },
  { enumValue: StateCode.Nj, name: "New Jersey" },
  { enumValue: StateCode.Nm, name: "New Mexico" },
  { enumValue: StateCode.Ny, name: "New York" },
  { enumValue: StateCode.Nc, name: "North Carolina" },
  { enumValue: StateCode.Nd, name: "North Dakota" },
  { enumValue: StateCode.Oh, name: "Ohio" },
  { enumValue: StateCode.Ok, name: "Oklahoma" },
  { enumValue: StateCode.Or, name: "Oregon" },
  { enumValue: StateCode.Pa, name: "Pennsylvania" },
  { enumValue: StateCode.Ri, name: "Rhode Island" },
  { enumValue: StateCode.Sc, name: "South Carolina" },
  { enumValue: StateCode.Sd, name: "South Dakota" },
  { enumValue: StateCode.Tn, name: "Tennessee" },
  { enumValue: StateCode.Tx, name: "Texas" },
  { enumValue: StateCode.Ut, name: "Utah" },
  { enumValue: StateCode.Vt, name: "Vermont" },
  { enumValue: StateCode.Va, name: "Virginia" },
  { enumValue: StateCode.Wa, name: "Washington" },
  { enumValue: StateCode.Wv, name: "West Virginia" },
  { enumValue: StateCode.Wi, name: "Wisconsin" },
  { enumValue: StateCode.Wy, name: "Wyoming" },
];
