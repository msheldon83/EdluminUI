import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Fragment } from "react";
import { getVacancyDetailsGrouping } from "./helpers";
import { TFunction } from "i18next";
import { VacancySummaryHeader } from "ui/components/absence/vacancy-summary-header";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { getAbsenceDateRangeDisplayTextWithDayOfWeek } from "./date-helpers";
import { projectVacancyDetailsFromVacancies } from "ui/pages/create-absence/project-vacancy-details";
import { VacancyDetail } from "./types";
import { format } from "date-fns";

type Props = {
  vacancies: Vacancy[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
  disabledDates?: DisabledDate[];
  detailsClassName?: string;
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
    <Grid container ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12}>
          <VacancySummaryHeader
            positionName={props.positionName}
            vacancies={props.vacancies}
            disabledDates={props.disabledDates}
          />
        </Grid>
      )}
      <div className={props.detailsClassName}>
        {sortedVacancies.map((v, i) => {
          if (v.details && v.details.length) {
            const projectedDetails = projectVacancyDetailsFromVacancies([v]);

            return (
              <Fragment key={i}>
                {getVacancyDetailsDisplay(
                  projectedDetails,
                  props.equalWidthDetails || false,
                  t,
                  classes,
                  props.disabledDates
                )}
              </Fragment>
            );
          }
        })}
      </div>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  details: {
    padding: theme.spacing(2),
  },
  scheduleText: {
    color: theme.customColors.edluminSubText,
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
  vacancyDetailsHeader: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.customColors.edluminSubText,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  subScheduleLocation: {
    marginLeft: theme.spacing(2),
  },
}));

const getVacancyDetailsDisplay = (
  vacancyDetails: VacancyDetail[],
  equalWidthDetails: boolean,
  t: TFunction,
  classes: any,
  disabledDates?: DisabledDate[]
) => {
  const groupedDetails = getVacancyDetailsGrouping(vacancyDetails);
  if (groupedDetails === null || !groupedDetails.length) {
    return null;
  }

  return (
    <>
      <Grid item container xs={12} className={classes.vacancyDetailsHeader}>
        <Grid item xs={equalWidthDetails ? 6 : 4}>
          {t("Absence")}
        </Grid>
        <Grid item xs={equalWidthDetails ? 6 : 8}>
          {t("Substitute schedule")}
        </Grid>
      </Grid>
      <div className={classes.details}>
        {groupedDetails.map((g, detailsIndex) => {
          const allDates = g.detailItems.map(di => di.date);

          return (
            <Grid key={detailsIndex} item container xs={12}>
              <Grid item xs={12}>
                <Typography variant="h6">
                  {getAbsenceDateRangeDisplayTextWithDayOfWeek(
                    allDates,
                    disabledDates
                  )}
                </Typography>
              </Grid>
              <Grid
                item
                xs={equalWidthDetails ? 6 : 4}
                className={classes.vacancyBlockItem}
              >
                {g.absenceStartTime && g.absenceEndTime && (
                  <div>
                    {`${format(g.absenceStartTime, "h:mm a")} - ${format(
                      g.absenceEndTime,
                      "h:mm a"
                    )}`}
                  </div>
                )}
              </Grid>
              <Grid
                item
                xs={equalWidthDetails ? 6 : 8}
                className={classes.vacancyBlockItem}
              >
                {g.simpleDetailItems!.map((d, i) => {
                  return (
                    <div key={i}>
                      {`${d.startTime} - ${d.endTime}`}
                      <span className={classes.subScheduleLocation}>
                        {d.locationName}
                      </span>
                    </div>
                  );
                })}
              </Grid>
            </Grid>
          );
        })}
      </div>
    </>
  );
};
