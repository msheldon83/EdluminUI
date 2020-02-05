import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Fragment, useMemo } from "react";
import {
  getVacancyDetailsGrouping,
  vacanciesHaveMultipleAssignments,
} from "./helpers";
import { TFunction } from "i18next";
import { VacancySummaryHeader } from "ui/components/absence/vacancy-summary-header";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import {
  getAbsenceDateRangeDisplayTextWithDayOfWeek,
  getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates,
} from "./date-helpers";
import { projectVacancyDetailsFromVacancies } from "ui/pages/create-absence/project-vacancy-details";
import { VacancyDetail } from "./types";
import { format } from "date-fns";
import { AssignedSub } from "./assigned-sub";

type Props = {
  vacancies: Vacancy[];
  positionName?: string | null | undefined;
  showHeader?: boolean;
  equalWidthDetails?: boolean;
  gridRef?: React.RefObject<HTMLDivElement>;
  disabledDates?: Date[];
  detailsClassName?: string;
};

export const VacancyDetails: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const { detailsClassName = classes.fullWidth } = props;

  const isSplitVacancy = useMemo(() => {
    return vacanciesHaveMultipleAssignments(props.vacancies);
  }, [props.vacancies]);

  const detailsUI = useMemo(() => {
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
        <div className={detailsClassName}>
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
                    isSplitVacancy,
                    props.disabledDates
                  )}
                </Fragment>
              );
            }
          })}
        </div>
      </Grid>
    );
  }, [
    props.vacancies,
    props.gridRef,
    props.positionName,
    props.disabledDates,
    detailsClassName,
    props.equalWidthDetails,
    t,
    classes,
    props.showHeader,
    isSplitVacancy,
  ]);

  if (!props.vacancies || !props.vacancies.length) {
    return <></>;
  }

  return detailsUI;
};

const useStyles = makeStyles(theme => ({
  fullWidth: {
    width: "100%",
  },
  scheduleText: {
    color: theme.customColors.edluminSubText,
  },
  vacancyBlockHeader: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
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
  unfilled: {
    padding: theme.spacing(2),
    backgroundColor: theme.customColors.lighterGray,
    color: theme.customColors.darkRed,
  },
}));

const getVacancyDetailsDisplay = (
  vacancyDetails: VacancyDetail[],
  equalWidthDetails: boolean,
  t: TFunction,
  classes: any,
  isSplitVacancy: boolean,
  disabledDates?: Date[]
) => {
  const groupedDetails = getVacancyDetailsGrouping(vacancyDetails);
  if (groupedDetails === null || !groupedDetails.length) {
    return null;
  }

  console.log(groupedDetails);

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
      <div>
        {groupedDetails.map((g, detailsIndex) => {
          const allDates = g.detailItems.map(di => di.date);

          return (
            <Grid key={detailsIndex} item container xs={12}>
              {isSplitVacancy && (
                <Grid item xs={12}>
                  {!g.assignmentId && (
                    <div className={classes.unfilled}>
                      <Typography variant={"h6"}>{t("Unfilled")}</Typography>
                    </div>
                  )}
                  {g.assignmentId && (
                    <AssignedSub
                      subText={t("assigned")}
                      disableReplacementInteractions={
                        false //props.disableReplacementInteractions
                      }
                      employeeId={g.assignmentEmployeeId ?? ""}
                      assignmentId={g.assignmentId}
                      employeeName={g.assignmentEmployeeName || ""}
                      onRemove={() => {}}
                      assignmentStartDate={g.startDate}
                      showLinkButton={true}
                    />
                  )}
                </Grid>
              )}
              <Grid item xs={12} className={classes.vacancyBlockHeader}>
                <Typography variant="h6">
                  {getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates(
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
