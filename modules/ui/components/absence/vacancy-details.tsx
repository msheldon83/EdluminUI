import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { Fragment, useMemo, useState } from "react";
import {
  getVacancyDetailsGrouping,
  vacanciesHaveMultipleAssignments,
  VacancyDetailsGroup,
  getGroupedVacancyDetails,
} from "./helpers";
import { VacancySummaryHeader } from "ui/components/absence/vacancy-summary-header";
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
  disableReplacementInteractions?: boolean;
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { detailsClassName = classes.fullWidth } = props;

  const isSplitVacancy = useMemo(() => {
    return vacanciesHaveMultipleAssignments(props.vacancies);
  }, [props.vacancies]);

  const groupedDetails = useMemo(() => {
    return getGroupedVacancyDetails(props.vacancies);
  }, [props.vacancies]);

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
                vacancies={props.vacancies}
                isSplitVacancy={isSplitVacancy}
                equalWidthDetails={props.equalWidthDetails || false}
                disabledDates={props.disabledDates}
                onCancelAssignment={props.onCancelAssignment}
                disableReplacementInteractions={
                  props.disableReplacementInteractions
                }
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
