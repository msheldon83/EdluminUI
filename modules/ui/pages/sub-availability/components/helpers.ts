import i18next = require("i18next");
import { getDisplayName } from "ui/components/enumHelpers";
import { UserAvailability } from "graphql/server-types.gen";
import { secondsToFormattedHourMinuteString } from "helpers/time";

export const formatAvailableTime = (time?: number) => {
  return time ? secondsToFormattedHourMinuteString(time) : undefined;
};

export const formatAvailabilityLabel = (
  t: i18next.TFunction,
  availability?: UserAvailability,
  time?: number,
  toLower?: boolean
) => {
  const availableTime = formatAvailableTime(time);
  const displayName =
    getDisplayName(
      "userAvailability",
      availability ?? UserAvailability.Available,
      t
    ) ?? "";

  const availabilityLabel = `${
    toLower ? displayName.toLocaleLowerCase() : displayName
  } ${availableTime ? ` ${availableTime}` : ""}`;

  return availabilityLabel;
};
