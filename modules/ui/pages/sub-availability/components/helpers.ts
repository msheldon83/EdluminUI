import i18next = require("i18next");
import { getDisplayName } from "ui/components/enumHelpers";
import { format } from "date-fns";
import { midnightTime } from "helpers/time";
import { UserAvailability } from "graphql/server-types.gen";

export const formatAvailableTime = (time?: number) => {
  return time ? format(midnightTime().setSeconds(time), "h:mm a") : undefined;
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
