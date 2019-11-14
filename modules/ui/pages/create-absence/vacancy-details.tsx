import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { getDateRangeDisplayText } from "helpers/date";
import { Fragment } from "react";
import { format, isValid, isDate } from "date-fns";

type Props = {
  vacancies: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
};

const getScheduleLettersArray = () => {
  return new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
};

const convertStringToDate = (dateString: string): Date | null => {
  if (dateString && isDate(dateString) && isValid(dateString)) {
    return new Date(dateString);
  }

  return null;
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

  console.log(props.vacancies);

  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);
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

  const scheduleLetters = getScheduleLettersArray();

  return (
    <Grid container spacing={2} ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12}>
          <Typography variant="h5">{headerText}</Typography>
        </Grid>
      )}
      {sortedVacancies.map((v, detailsIndex) => {
        return (
          <Grid key={detailsIndex} item container xs={12} alignItems="center">
            <Grid item xs={2}>
              <Typography variant="h6">
                {getDateRangeDisplayText(
                  convertStringToDate(v.startTimeLocal),
                  convertStringToDate(v.endTimeLocal)
                )}
              </Typography>
            </Grid>
            <Grid item xs={10} className={classes.scheduleText}>
              {`${t("Schedule")} ${scheduleLetters[detailsIndex]}`}
            </Grid>
            {v.details &&
              v.details.map((b, blocksIndex) => {
                return (
                  <Fragment key={blocksIndex}>
                    <Grid item xs={2} className={classes.vacancyBlockItem}>
                      {`${format(
                        convertStringToDate(b!.startTimeLocal) ?? new Date(),
                        "h:mm a"
                      )} - ${format(
                        convertStringToDate(b!.endTimeLocal) ?? new Date(),
                        "h:mm a"
                      )}`}
                    </Grid>
                    <Grid item xs={10} className={classes.vacancyBlockItem}>
                      {b!.location ? b!.location.name : b!.locationId}
                    </Grid>
                  </Fragment>
                );
              })}
          </Grid>
        );
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  scheduleText: {
    color: "#9E9E9E",
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
}));
