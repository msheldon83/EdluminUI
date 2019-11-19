import { Grid, makeStyles, Typography } from "@material-ui/core";
import { convertStringToDate, getDateRangeDisplayText } from "helpers/date";
import { groupBy } from "lodash-es";
import * as React from "react";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { VacancyDisplayData } from "../ui";
import { VacancyDetailRow } from "./vacancy-row";
import { VacancySummaryHeader } from "./vacancy-summary-header";

type Props = {
  vacancies: VacancyDisplayData;
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

  const scheduleLetters = React.useMemo(() => getScheduleLettersArray(), []);

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

  const sortedVacancies = props.vacancies
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  return (
    <Grid container spacing={2} ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12}>
          <VacancySummaryHeader
            positionName={props.positionName}
            vacancies={props.vacancies}
          />
        </Grid>
      )}

      {sortedVacancies.map((v, detailsIndex) => {
        const groupedDetails = groupBy(v.details, d => {
          return d!.startTimeLocal && d!.endTimeLocal && d!.locationId;
        });
        console.log(groupedDetails);

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

            {Object.entries(groupedDetails).map(([key, value], groupIndex) => (
              <Fragment key={groupIndex}>
                <VacancyDetailRow
                  vacancyDetails={value}
                  equalWidthDetails={props.equalWidthDetails}
                />
              </Fragment>
            ))}
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
