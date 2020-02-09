import { Typography } from "@material-ui/core";
import { uniq, flatMap } from "lodash-es";
import * as React from "react";
import { getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates } from "./date-helpers";
import { VacancyDetailsGroup } from "./helpers";

type Props = {
  vacancyDetailGroupings: VacancyDetailsGroup[];
  positionName?: string | null;
  disabledDates?: Date[];
};

export const VacancySummaryHeader: React.FC<Props> = props => {
  const allDates = uniq(
    flatMap(
      props.vacancyDetailGroupings.map(vd => vd.detailItems.map(di => di.date))
    )
  );
  const dayLengthDisplayText =
    allDates.length > 1 ? `${allDates.length} days` : `${allDates.length} day`;

  let headerText = getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates(
    allDates,
    props.disabledDates
  );
  headerText = props.positionName
    ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
    : `${headerText} (${dayLengthDisplayText})`;

  return <Typography variant="h5">{headerText}</Typography>;
};
