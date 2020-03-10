import i18next = require("i18next");
import { getDisplayName } from "ui/components/enumHelpers";
import { UserAvailability } from "graphql/server-types.gen";
import { secondsToFormattedString } from "helpers/time";

export const formatAvailableTime = (time?: number) => {
  return time ? secondsToFormattedString(time) : undefined;
};

export const formatAvailabilityLabel = (
  t: i18next.TFunction,
  availability?: UserAvailability,
  time?: number
) => {
  const availableTime = formatAvailableTime(time);

  const availabilityLabel = `${getDisplayName(
    "userAvailability",
    availability ?? UserAvailability.Available,
    t
  )}${availableTime ? ` ${availableTime}` : ""}`;

  return availabilityLabel;
};
