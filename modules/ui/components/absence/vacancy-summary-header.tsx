import { Typography } from "@material-ui/core";
import { uniq, flatMap } from "lodash-es";
import * as React from "react";
import { getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates } from "ui/components/date-helpers";

type Props = {
  vacancyDates: Date[];
  positionName?: string | null;
  disabledDates?: Date[];  
};

export const VacancySummaryHeader: React.FC<Props> = props => {
  const allDates = uniq(flatMap(props.vacancyDates.map(d => d)));
  const uniqueDays = uniq(allDates.map(a => a.toString()));
  const dayLengthDisplayText =
    uniqueDays.length > 1
      ? `${uniqueDays.length} days`
      : `${uniqueDays.length} day`;

  let headerText = getDateRangeDisplayTextWithOutDayOfWeekForContiguousDates(
    allDates,
    props.disabledDates
  );
  headerText = props.positionName
    ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
    : `${headerText} (${dayLengthDisplayText})`;

  return <Typography variant="h5">{headerText}</Typography>;
};
