import { OptionType } from "ui/components/form/select-new";

export const getCalendarSummaryText = (
  locationOptions: OptionType[],
  contractOptions: OptionType[],
  affectsAllContracts: boolean,
  affectsAllLocations: boolean,
  contractIds?: (string | null | undefined)[],
  locationIds?: (string | null | undefined)[]
) => {
  let stringBuilder = "";
  //Build string for Summary text based on values from locationIds & ContractIds
  // for the entire district
  // for all positions @ [Location]
  // for all positions @ [Location1] & [Location 2]
  // for all positions @ [Location1], [Location2] & [Location3]
  // for all positions @ the 5 schools selected below
  // for all positions on [Contract] contract
  // for all positions on [Contract1] & [Contract2] contracts
  // for all positions on [Contract1], [Contract2] & [Contract3] contracts
  // for all positions on the 5 contracts selected below
  // + combinations of selections
  //    for all positions on [Contract1] @ [Location1] & [Location2]

  return stringBuilder;
};
