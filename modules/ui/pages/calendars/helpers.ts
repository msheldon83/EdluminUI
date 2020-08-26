import { OptionType } from "ui/components/form/select-new";
import { TFunction } from "i18next";

export const getCalendarSummaryText = (
  locationOptions: OptionType[],
  contractOptions: OptionType[],
  affectsAllContracts: boolean,
  affectsAllLocations: boolean,
  contractIds: string[],
  locationIds: string[],
  t: TFunction
) => {
  let result = "";
  let temp = "";

  if (affectsAllLocations && affectsAllContracts) {
    temp = t("for all positions at all schools");
    return result.concat(temp);
  }

  const contracts =
    contractIds &&
    contractOptions
      .filter(c => contractIds.find(x => x === c.value))
      .map(c => {
        return c.label;
      })
      .sort();

  const locations =
    locationIds &&
    locationOptions
      .filter(c => locationIds.find(x => x === c.value))
      .map(c => {
        return c.label;
      })
      .sort();

  //User has not specified any values.
  if (
    !affectsAllLocations &&
    !affectsAllContracts &&
    contracts.length === 0 &&
    locations.length === 0
  ) {
    temp = t("must specifiy a contract and school");
    return result.concat(temp);
  }

  //Start building summary string
  result = t("for all positions");

  if (contracts.length > 0) {
    if (contracts.length === 1) {
      temp = t(` on ${contracts[0]} contract`);
    } else if (contracts.length === 2) {
      temp = t(` on ${contracts[0]} & ${contracts[1]} contracts`);
    } else if (contracts.length === 3) {
      temp = t(
        ` on ${contracts[0]}, ${contracts[1]} & ${contracts[2]} contracts`
      );
    } else if (contracts.length === 4) {
      temp = t(
        ` on ${contracts[0]}, ${contracts[1]}, ${contracts[2]} & ${contracts[3]} contracts`
      );
    } else {
      if (locations.length > 0) {
        temp = t(` on the ${contracts.length}`);
      } else {
        temp = t(` on the ${contracts.length} selected below`);
      }
    }

    if (affectsAllLocations) {
      temp = temp.concat(t(" for the entire district"));
    }
    result = result.concat(temp);
  }

  if (locations.length > 0) {
    if (affectsAllContracts) {
      temp = temp.concat(t(" on all contracts"));
    }

    if (locations.length === 1) {
      temp = t(` at ${locations[0]}`);
    } else if (locations.length === 2) {
      temp = t(` at ${locations[0]} & ${locations[1]}`);
    } else if (locations.length === 3) {
      temp = t(` at ${locations[0]}, ${locations[1]} & ${locations[2]}`);
    } else if (locations.length === 4) {
      temp = t(
        ` at ${locations[0]}, ${locations[1]}, ${locations[2]} & ${locations[3]}`
      );
    } else {
      temp = t(` at the ${locations.length} schools selected below`);
    }

    result = result.concat(temp);
  }

  return result;
};
