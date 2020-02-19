import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles } from "@material-ui/core";
import { useMemo } from "react";
import {
  getGroupedVacancyDetails,
} from "./helpers";
import { VacancySummaryHeader } from "ui/components/absence/vacancy-summary-header";
import { VacancyDetailRow } from "./vacancy-detail-row";
import { AssignmentOnDate } from "./types";
import { uniqBy } from "lodash-es";

type Props = {
  vacancies: Vacancy[];
  vacancyDetailIds?: string[];
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
  onAssignSubClick?: (
    vacancyDetailIds?: string[],
    employeeToReplace?: string
  ) => void;
  assignmentsByDate: AssignmentOnDate[];
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    assignmentsByDate,
    vacancies = [],
    vacancyDetailIds = [],
    detailsClassName = classes.fullWidth,
  } = props;

  // Filter the Vacancies and Vacancy Details down to the ones
  // we are interested in based on props.vacancyDetailIds
  const filteredVacancies = useMemo(() => {
    if (vacancyDetailIds.length === 0) {
      return vacancies;
    }

    const vacancyList: Vacancy[] = [];
    vacancies.forEach(v => {
      const matchingDetails =
        v.details?.filter(d => vacancyDetailIds.includes(d?.id ?? "")) ?? [];
      if (matchingDetails.length > 0) {
        vacancyList.push({
          ...v,
          details: matchingDetails,
        });
      }
    });
    return vacancyList;
  }, [vacancies, vacancyDetailIds]);

  const isSplitVacancy = useMemo(() => {
    const uniqueRecords = uniqBy(assignmentsByDate, "assignmentId");
    return uniqueRecords.length > 1;
  }, [assignmentsByDate]);

  const groupedDetails = useMemo(() => {
    return getGroupedVacancyDetails(filteredVacancies, assignmentsByDate);
  }, [filteredVacancies, assignmentsByDate]);

  if (filteredVacancies.length === 0) {
    return <></>;
  }

  return (
    <Grid container ref={props.gridRef || null}>
      {props.showHeader && (
        <Grid item xs={12} className={classes.vacancySummaryHeader}>
          <VacancySummaryHeader
            vacancyDetailGroupings={groupedDetails}
            positionName={props.positionName}
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
            <Grid
              key={detailsIndex}
              item
              container
              xs={12}
              className={classes.detailRow}
            >
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
                onAssignSubClick={props.onAssignSubClick}
                assignmentsByDate={assignmentsByDate}
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
  detailRow: {
    paddingBottom: theme.spacing(),
  },
}));
