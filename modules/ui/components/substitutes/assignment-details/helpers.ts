import { formatIsoDateIfPossible } from "helpers/date";
import { groupBy } from "lodash-es";

type Detail = {
  startTimeLocal?: string;
  endTimeLocal?: string;
};

export const detailsHaveMultipleTimes = (details?: Detail[]) => {
  const multipleStarts =
    Object.entries(
      groupBy(details, a =>
        formatIsoDateIfPossible(a.startTimeLocal, "h:mm aaa")
      )
    ).length > 1;

  const multipleEndTimes =
    Object.entries(
      groupBy(details, a => formatIsoDateIfPossible(a.endTimeLocal, "h:mm aaa"))
    ).length > 1;
  return multipleStarts && multipleEndTimes;
};
