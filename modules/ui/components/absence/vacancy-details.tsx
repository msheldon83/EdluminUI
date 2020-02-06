import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Fragment, useMemo, useState } from "react";
import {
  getVacancyDetailsGrouping,
  vacanciesHaveMultipleAssignments,
  VacancyDetailsGroup,
} from "./helpers";
import { VacancySummaryHeader } from "ui/components/absence/vacancy-summary-header";
import { projectVacancyDetailsFromVacancies } from "ui/pages/create-absence/project-vacancy-details";
import { VacancyDetailRow } from "./vacancy-detail-row";

type Props = {
  vacancies: Vacancy[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
  disabledDates?: Date[];
  detailsClassName?: string;
  onCancelAssignment?: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => Promise<void>;
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { detailsClassName = classes.fullWidth } = props;

  const isSplitVacancy = useMemo(() => {
    return vacanciesHaveMultipleAssignments(props.vacancies);
  }, [props.vacancies]);

  const sortedVacancies = useMemo(() => {
    if (!props.vacancies) {
      return [];
    }

    return props.vacancies
      .slice()
      .sort((a, b) => a.startTimeLocal - b.startTimeLocal);
  }, [props.vacancies]);

  const groupedDetails = useMemo(() => {
    const allGroupedDetails: VacancyDetailsGroup[] = [];

    sortedVacancies.forEach(v => {
      if (v.details && v.details.length > 0) {
        const projectedDetails = projectVacancyDetailsFromVacancies([v]);
        const groupedDetails = getVacancyDetailsGrouping(projectedDetails);
        if (groupedDetails !== null && groupedDetails.length > 0) {
          allGroupedDetails.push(...groupedDetails);
        }
      }
    });

    return allGroupedDetails;
  }, [sortedVacancies]);

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

  return (
    <Grid container ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12} className={classes.vacancySummaryHeader}>
          <VacancySummaryHeader
            positionName={props.positionName}
            vacancies={props.vacancies}
            disabledDates={props.disabledDates}
          />
        </Grid>
      )}
      <div className={detailsClassName}>
        <Grid item container xs={12} className={classes.vacancyDetailsHeader}>
          <Grid item xs={props.equalWidthDetails ? 6 : 4}>
            {t("Absence")}
          </Grid>
          <Grid item xs={props.equalWidthDetails ? 6 : 8}>
            {t("Substitute schedule")}
          </Grid>
        </Grid>
        {groupedDetails.map((g, detailsIndex) => {
          return (
            <Grid key={detailsIndex} item container xs={12}>
              <VacancyDetailRow
                groupedDetail={g}
                allGroupedDetails={groupedDetails}
                isSplitVacancy={isSplitVacancy}
                equalWidthDetails={props.equalWidthDetails || false}
                disabledDates={props.disabledDates}
                onCancelAssignment={props.onCancelAssignment}
              />
            </Grid>
          );
        })}
      </div>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  fullWidth: {
    width: "100%",
  },
  vacancySummaryHeader: {
    marginBottom: theme.spacing(),
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
}));
