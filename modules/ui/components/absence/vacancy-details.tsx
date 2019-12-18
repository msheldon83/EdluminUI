import * as React from "react";
import { Vacancy, VacancyDetail, Maybe } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Fragment } from "react";
import { getVacancyDetailsGrouping } from "./helpers";
import { TFunction } from "i18next";
import { VacancySummaryHeader } from "ui/components/absence/vacancy-summary-header";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { getAbsenceDateRangeDisplayText } from "./date-helpers";

type Props = {
  vacancies: Vacancy[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
  disabledDates?: DisabledDate[];
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

  return (
    <Grid container spacing={2} ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12}>
          <VacancySummaryHeader
            positionName={props.positionName}
            vacancies={props.vacancies}
            disabledDates={props.disabledDates}
          />
        </Grid>
      )}
      {sortedVacancies.map(v => {
        if (v.details && v.details.length) {
          return getVacancyDetailsDisplay(
            v.details,
            props.equalWidthDetails || false,
            t,
            classes,
            props.disabledDates
          );
        }
      })}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  scheduleText: {
    color: theme.customColors.edluminSubText,
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
}));

const getVacancyDetailsDisplay = (
  vacancyDetails: Maybe<VacancyDetail>[],
  equalWidthDetails: boolean,
  t: TFunction,
  classes: any,
  disabledDates?: DisabledDate[]
) => {
  const groupedDetails = getVacancyDetailsGrouping(vacancyDetails);
  if (groupedDetails === null || !groupedDetails.length) {
    return null;
  }

  return groupedDetails.map((g, detailsIndex) => {
    return (
      <Grid key={detailsIndex} item container xs={12} alignItems="center">
        <Grid item xs={equalWidthDetails ? 6 : 2}>
          <Typography variant="h6">
            {getAbsenceDateRangeDisplayText(
              g.startDate,
              g.endDate ?? new Date(),
              disabledDates
            )}
          </Typography>
        </Grid>
        <Grid
          item
          xs={equalWidthDetails ? 6 : 10}
          className={classes.scheduleText}
        >
          {`${t("Schedule")} ${g.schedule}`}
        </Grid>
        {g.simpleDetailItems!.map((d, i) => {
          return (
            <Fragment key={i}>
              <Grid
                item
                xs={equalWidthDetails ? 6 : 2}
                className={classes.vacancyBlockItem}
              >
                {`${d.startTime} - ${d.endTime}`}
              </Grid>
              <Grid
                item
                xs={equalWidthDetails ? 6 : 10}
                className={classes.vacancyBlockItem}
              >
                {d.locationName}
              </Grid>
            </Fragment>
          );
        })}
      </Grid>
    );
  });
};
