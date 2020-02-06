import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import { VacancyDetailsGroup } from "./helpers";
import { getAbsenceDateRangeDisplayTextWithDayOfWeekForContiguousDates } from "./date-helpers";
import { format } from "date-fns";
import { AssignedSub } from "./assigned-sub";
import { useMemo } from "react";
import { Vacancy } from "graphql/server-types.gen";

type Props = {
  groupedDetail: VacancyDetailsGroup;
  vacancies: Vacancy[];
  isSplitVacancy: boolean;
  equalWidthDetails?: boolean;
  disabledDates?: Date[];
  onCancelAssignment?: (
    assignmentId?: string,
    assignmentRowVersion?: string,
    vacancyDetailIds?: string[]
  ) => Promise<void>;
  disableReplacementInteractions?: boolean;
};

export const VacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const {
    groupedDetail,
    vacancies,
    isSplitVacancy,
    onCancelAssignment,
    equalWidthDetails = false,
    disabledDates = [],
  } = props;

  const allDates = useMemo(() => {
    return groupedDetail.detailItems.map(di => di.date);
  }, [groupedDetail]);

  return (
    <>
      {isSplitVacancy && (
        <Grid item xs={12}>
          {!groupedDetail.assignmentId && (
            <div className={classes.unfilled}>
              <Typography variant={"h6"}>{t("Unfilled")}</Typography>
            </div>
          )}
          {groupedDetail.assignmentId && (
            <AssignedSub
              subText={t("assigned")}
              disableReplacementInteractions={
                props.disableReplacementInteractions
              }
              employeeId={groupedDetail.assignmentEmployeeId ?? ""}
              assignmentId={groupedDetail.assignmentId}
              employeeName={groupedDetail.assignmentEmployeeName || ""}
              onCancelAssignment={onCancelAssignment}
              assignmentStartDate={
                groupedDetail.assignmentStartTime ?? groupedDetail.startDate
              }
              showLinkButton={true}
              vacancies={vacancies}
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
        {groupedDetail.absenceStartTime && groupedDetail.absenceEndTime && (
          <div>
            {`${format(groupedDetail.absenceStartTime, "h:mm a")} - ${format(
              groupedDetail.absenceEndTime,
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
        {groupedDetail.simpleDetailItems!.map((d, i) => {
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
    </>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyBlockHeader: {
    marginTop: theme.spacing(),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
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
