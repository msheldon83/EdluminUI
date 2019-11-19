import * as React from "react";
import { Typography } from "@material-ui/core";
import { VacancyDisplayData } from "../ui";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";

type Props = {
  positionName?: string | null;
  vacancies: VacancyDisplayData;
};

export const VacancySummaryHeader: React.FC<Props> = props => {
  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  console.log("props", props.vacancies);
  console.log(sortedVacancies);
  const firstVacancy = sortedVacancies[0];
  const lastVacancy = sortedVacancies[sortedVacancies.length - 1];
  const totalVacancyDays = sortedVacancies.reduce((total, v) => {
    return v.numDays ? total + v.numDays : total;
  }, 0);

  // Build the Vacancy Details header text
  const dayLengthDisplayText =
    totalVacancyDays > 1
      ? `${totalVacancyDays} days`
      : `${totalVacancyDays} day`;
  let headerText = getDateRangeDisplayText(
    convertStringToDate(firstVacancy.startTimeLocal),
    convertStringToDate(lastVacancy.endTimeLocal)
  );
  headerText = props.positionName
    ? `${headerText} (${dayLengthDisplayText}) - ${props.positionName}`
    : `${headerText} (${dayLengthDisplayText})`;

  return <Typography variant="h5">{headerText}</Typography>;
};
