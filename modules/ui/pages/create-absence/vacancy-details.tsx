import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";
import { Fragment } from "react";
import { format } from "date-fns";
import { groupBy } from "lodash-es";

type Props = {
  vacancies: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
};

const getScheduleLettersArray = () => {
  return new Array(26).fill(1).map((_, i) => String.fromCharCode(65 + i));
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

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
        const groupedDetails = groupBy(v.details, d => {
          return d!.startTimeLocal && d!.endTimeLocal && d!.locationId;
        });

        const startDateLocal = convertStringToDate(v.startTimeLocal);
        const endDateLocal = convertStringToDate(v.endTimeLocal);
        if (!startDateLocal || !endDateLocal) {
          return;
        }

        return (
          <Grid key={detailsIndex} item container xs={12} alignItems="center">
            <Grid item xs={props.equalWidthDetails ? 6 : 2}>
              <Typography variant="h6">
                {getDateRangeDisplayText(startDateLocal, endDateLocal)}
              </Typography>
            </Grid>
            <Grid
              item
              xs={props.equalWidthDetails ? 6 : 10}
              className={classes.scheduleText}
            >
              {`${t("Schedule")} ${scheduleLetters[detailsIndex]}`}
            </Grid>
            {Object.entries(groupedDetails).map(([key, value], groupIndex) => {
              const firstDetail = value[0];
              if (!firstDetail) {
                return;
              }

              const detailStartTimeLocal = convertStringToDate(
                firstDetail.startTimeLocal
              );
              const detailEndTimeLocal = convertStringToDate(
                firstDetail.endTimeLocal
              );
              if (!detailStartTimeLocal || !detailEndTimeLocal) {
                return;
              }

              return (
                <Fragment key={groupIndex}>
                  <Grid
                    item
                    xs={props.equalWidthDetails ? 6 : 2}
                    className={classes.vacancyBlockItem}
                  >
                    {`${format(detailStartTimeLocal, "h:mm a")} - ${format(
                      detailEndTimeLocal,
                      "h:mm a"
                    )}`}
                  </Grid>
                  <Grid
                    item
                    xs={props.equalWidthDetails ? 6 : 10}
                    className={classes.vacancyBlockItem}
                  >
                    {firstDetail.location
                      ? firstDetail.location.name
                      : firstDetail.locationId}
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
