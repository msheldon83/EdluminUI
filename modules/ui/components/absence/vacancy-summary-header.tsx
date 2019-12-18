import * as React from "react";
import { Typography } from "@material-ui/core";
import { Vacancy } from "graphql/server-types.gen";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { getAbsenceDateRangeDisplayText } from "./date-helpers";
import { convertStringToDate } from "helpers/date";

type Props = {
  positionName?: string | null;
  vacancies: Vacancy[];
  disabledDates?: DisabledDate[];
};

export const VacancySummaryHeader: React.FC<Props> = props => {
  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  const firstVacancy = sortedVacancies[0];
  const lastVacancy = sortedVacancies[sortedVacancies.length - 1];
  const totalVacancyDays = sortedVacancies.reduce((total, v) => {
    return v.numDays ? total + v.numDays : total;
  }, 0);

  const dayLengthDisplayText =
    totalVacancyDays > 1
      ? `${totalVacancyDays} days`
      : `${totalVacancyDays} day`;

  let headerText = getAbsenceDateRangeDisplayText(
    convertStringToDate(firstVacancy.startTimeLocal),
    convertStringToDate(lastVacancy.endTimeLocal),
    props.disabledDates
  );
  headerText = props.positionName
    ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
    : `${headerText} (${dayLengthDisplayText})`;

  return <Typography variant="h5">{headerText}</Typography>;
};
