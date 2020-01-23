import * as React from "react";
import { Typography } from "@material-ui/core";
import { Vacancy } from "graphql/server-types.gen";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { getAbsenceDateRangeDisplayTextWithDayOfWeek } from "./date-helpers";
import { flatMap, compact } from "lodash-es";
import { parseISO } from "date-fns";

type Props = {
  positionName?: string | null;
  vacancies: Vacancy[];
  disabledDates?: DisabledDate[];
};

export const VacancySummaryHeader: React.FC<Props> = props => {
  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  const totalVacancyDays = sortedVacancies.reduce((total, v) => {
    return v.numDays ? total + v.numDays : total;
  }, 0);

  const dayLengthDisplayText =
    totalVacancyDays > 1
      ? `${totalVacancyDays} days`
      : `${totalVacancyDays} day`;

  const allDateStrings = compact(
    flatMap(sortedVacancies.map(sv => sv.details!.map(d => d?.startDate)))
  );
  const allDates = allDateStrings.map(d => parseISO(d));
  let headerText = getAbsenceDateRangeDisplayTextWithDayOfWeek(
    allDates,
    props.disabledDates
  );
  headerText = props.positionName
    ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
    : `${headerText} (${dayLengthDisplayText})`;

  return <Typography variant="h5">{headerText}</Typography>;
};
