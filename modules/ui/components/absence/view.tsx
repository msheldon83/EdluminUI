import * as React from "react";
import { Grid, makeStyles, Typography, Button, Paper } from "@material-ui/core";
import {
  Absence,
  Vacancy,
  AbsenceReason,
  DayPart,
  AbsenceDetail,
  Assignment,
  Maybe,
} from "graphql/server-types.gen";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { VacancyDetails } from "./vacancy-details";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { Calendar } from "../form/calendar";
import { format, isAfter, isWithinInterval } from "date-fns";
import { groupBy, differenceWith, uniqWith } from "lodash-es";
import { convertStringToDate, getDateRangeDisplayText } from "helpers/date";
import {
  dayPartToLabel,
  getReplacementEmployeeForVacancy,
  ReplacementEmployeeForVacancy,
} from "./helpers";
import { AssignedSub } from "./assigned-sub";
import { useState } from "react";
import { useSnackbar } from "hooks/use-snackbar";
import { useMutationBundle } from "graphql/hooks";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  isConfirmation?: boolean;
  disabledDates: Date[];
};

export const View: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const { openSnackbar } = useSnackbar();
  const absenceReasons = useAbsenceReasons(props.orgId);

  const absence = props.absence;
  const [
    replacementEmployeeInformation,
    setReplacementEmployeeInformation,
  ] = useState<ReplacementEmployeeForVacancy | null>(
    getReplacementEmployeeForVacancy(absence)
  );

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      openSnackbar({
        message: error.graphQLErrors.map((e, i) => {
          const errorMessage =
            e.extensions?.data?.text ?? e.extensions?.data?.code;
          if (!errorMessage) {
            return null;
          }
          return <div key={i}>{errorMessage}</div>;
        }),
        dismissable: true,
        status: "error",
      });
    },
  });

  if (!absence) {
    return null;
  }

  const removeSub = async (
    employeeId: number,
    assignmentId?: string,
    assignmentRowVersion?: string
  ) => {
    const result = await cancelAssignment({
      variables: {
        cancelRequest: {
          id: Number(assignmentId) ?? "",
          rowVersion: assignmentRowVersion ?? "",
        },
      },
    });
  };

  const hasVacancies = absence.vacancies && absence.vacancies.length;
  const notesToReplacement =
    absence.vacancies && absence.vacancies[0]
      ? absence.vacancies[0].notesToReplacement
      : undefined;

  return (
    <div>
      <Grid container alignItems="flex-start">
        <Grid item xs={hasVacancies ? 5 : 12} container>
          <Grid item xs={12}>
            <Typography variant="h5">{t("Absence Details")}</Typography>
          </Grid>
          <Grid item xs={12} className={classes.absenceDetailsSection}>
            <div>
              {getAbsenceReasonListDisplay(absence, absenceReasons, classes)}
            </div>

            <div className={classes.dates}>
              <Calendar
                startDate={new Date(`${absence.startDate} 00:00`)}
                endDate={new Date(`${absence.endDate} 00:00`)}
                range={true}
                disableDays={true}
                disabledDates={props.disabledDates}
              />
            </div>

            <div className={classes.notesToApproverSection}>
              <Typography variant={"h6"}>
                {t("Notes for administrator")}
              </Typography>
              <Typography className={classes.subText}>
                {t("Can be seen by the administrator and the employee.")}
              </Typography>
              <div className={classes.notesForApprover}>
                {absence.notesToApprover || (
                  <span className={classes.valueMissing}>
                    {t("No Notes Specified")}
                  </span>
                )}
              </div>
            </div>
          </Grid>
        </Grid>
        {hasVacancies && (
          <Grid item xs={7} container>
            <Grid item xs={12}>
              <Typography variant="h5">{t("Substitute Details")}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.substituteDetailsSection}>
                {replacementEmployeeInformation && (
                  <AssignedSub
                    employeeId={replacementEmployeeInformation.employeeId}
                    employeeName={`${replacementEmployeeInformation.firstName} ${replacementEmployeeInformation.lastName}`}
                    subText={
                      props.isConfirmation ? t("pre-arranged") : t("assigned")
                    }
                    assignmentId={replacementEmployeeInformation.assignmentId}
                    assignmentRowVersion={
                      replacementEmployeeInformation.assignmentRowVersion
                    }
                    onRemove={async (...props) => {
                      await removeSub(...props);
                      setReplacementEmployeeInformation(null);
                    }}
                  />
                )}
                <div className={classes.vacancyDetails}>
                  <div className={classes.requiresSubSection}>
                    <Typography variant="h6">
                      {t("Requires a substitute")}
                    </Typography>
                  </div>
                  <VacancyDetails
                    vacancies={
                      absence.vacancies as Pick<
                        Vacancy,
                        | "startTimeLocal"
                        | "endTimeLocal"
                        | "numDays"
                        | "positionId"
                        | "details"
                      >[]
                    }
                    equalWidthDetails
                  />
                  <div className={classes.notesForSubSection}>
                    <Typography variant={"h6"}>
                      {t("Notes for substitute")}
                    </Typography>
                    <Typography className={classes.subText}>
                      {t(
                        "Can be seen by the substitute, administrator and employee."
                      )}
                    </Typography>
                    <div className={classes.notesForSub}>
                      {notesToReplacement || (
                        <span className={classes.valueMissing}>
                          {t("No Notes Specified")}
                        </span>
                      )}
                    </div>
                  </div>
                  {props.isConfirmation && (
                    <div className={classes.edit}>
                      <Button variant="outlined" onClick={() => {}}>
                        {t("Edit")}
                      </Button>
                    </div>
                  )}
                </div>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Grid>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  absenceDetailsSection: {
    marginTop: theme.spacing(),
  },
  substituteDetailsSection: {
    marginTop: theme.spacing(2),
  },
  vacancyDetails: {
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(4),
  },
  absenceReasonDetails: {
    fontWeight: "bold",
  },
  dates: {
    marginTop: theme.spacing(2),
  },
  notesToApproverSection: {
    marginTop: theme.spacing(2),
  },
  notesForApprover: {
    marginTop: theme.spacing(),
    paddingRight: theme.spacing(6),
  },
  requiresSubSection: {
    marginBottom: theme.spacing(2),
  },
  preArrangedChip: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  notesForSubSection: {
    marginTop: theme.spacing(4),
  },
  notesForSub: {
    marginTop: theme.spacing(),
  },
  subText: {
    color: theme.customColors.darkGray,
  },
  edit: {
    marginTop: theme.spacing(4),
  },
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));

type DetailsGroup = {
  startDate: Date;
  endDate?: Date;
  detailItems: DetailsItemByDate[];
  simpleDetailItems?: DetailsItem[];
  absenceReasonId?: number;
};

type DetailsItem = {
  dayPart: DayPart;
  startTime: string;
  endTime: string;
  absenceReasonId: number;
};

type DetailsItemByDate = DetailsItem & { date: Date };

/* TODO: Currently we are assuming that there is only 1 Absence Reason in
    use per Absence Detail. As we build in support for more complicated
    Absences, we will have to revisit this.
*/

const getAbsenceReasonListDisplay = (
  absence: Absence,
  absenceReasons: Pick<AbsenceReason, "id" | "name">[],
  classes: any
) => {
  const detailsGrouping = getDetailsGrouping(absence);
  if (detailsGrouping === null || !detailsGrouping.length) {
    return null;
  }

  return detailsGrouping.map((d, groupIndex) => {
    const matchingAbsenceReason = absenceReasons.find(
      a => a.id === d.absenceReasonId?.toString()
    );

    return (
      <div key={groupIndex}>
        <div className={classes.absenceReasonDetails}>
          {matchingAbsenceReason?.name}
        </div>
        <Typography variant="h6">
          {getDateRangeDisplayText(d.startDate, d.endDate ?? new Date())}
        </Typography>
        {d.simpleDetailItems &&
          d.simpleDetailItems.map((di, detailIndex) => {
            return (
              <div key={detailIndex} className={classes.absenceReasonDetails}>
                {`${dayPartToLabel(di.dayPart)} (${di.startTime} - ${
                  di.endTime
                })`}
              </div>
            );
          })}
      </div>
    );
  });
};

const getDetailsGrouping = (absence: Absence) => {
  if (!absence.details) {
    return null;
  }

  // Put the details in order by start date and time
  const sortedAbsenceDetails = absence.details
    .slice()
    .sort((a, b) => a!.startTimeLocal - b!.startTimeLocal);

  // Group all of the details that are on the same day together
  const detailsGroupedByStartDate = groupBy(sortedAbsenceDetails, d => {
    return d!.startDate;
  });

  const detailsGroupings: DetailsGroup[] = [];
  Object.entries(detailsGroupedByStartDate).forEach(([key, value]) => {
    const keyAsDate = new Date(`${key} 00:00`);
    // Look for a potential matching group to add to
    const potentialGroup = detailsGroupings.find(g => {
      if (!g.endDate) {
        return isAfter(keyAsDate, g.startDate);
      }

      return isWithinInterval(keyAsDate, {
        start: g.startDate,
        end: g.endDate,
      });
    });

    // Determine if we're going to add to the Group we found or not
    let addToGroup = false;
    if (potentialGroup) {
      const valuesAsDetailItems = convertAbsenceDetailsToDetailsItem(
        keyAsDate,
        value
      );
      const differences = differenceWith(
        valuesAsDetailItems,
        potentialGroup.detailItems,
        (a, b) => {
          return (
            a.startTime === b.startTime &&
            a.endTime === b.endTime &&
            a.absenceReasonId === b.absenceReasonId
          );
        }
      );
      addToGroup = !differences.length;
    }

    if (potentialGroup && addToGroup) {
      potentialGroup.detailItems.push(
        ...convertAbsenceDetailsToDetailsItem(keyAsDate, value)
      );
    } else {
      if (potentialGroup) {
        // Set the endDate of the previous Group
        potentialGroup.endDate =
          potentialGroup.detailItems[
            potentialGroup.detailItems.length - 1
          ].date;
      }

      // Add a new grouping item
      detailsGroupings.push({
        startDate: new Date(`${key} 00:00`),
        detailItems: convertAbsenceDetailsToDetailsItem(keyAsDate, value),
      });
    }
  });

  if (detailsGroupings && detailsGroupings.length) {
    // Set the endDate on the last item
    const lastItem = detailsGroupings[detailsGroupings.length - 1];
    lastItem.endDate =
      lastItem.detailItems[lastItem.detailItems.length - 1].date;
  }

  // Populate the simple detail items on the groups
  detailsGroupings.forEach(g => {
    g.absenceReasonId = g.detailItems[0].absenceReasonId;
    g.simpleDetailItems = uniqWith(
      g.detailItems.map(di => {
        return {
          dayPart: di.dayPart,
          startTime: di.startTime,
          endTime: di.endTime,
          absenceReasonId: di.absenceReasonId,
        };
      }),
      (a, b) => {
        return (
          a.startTime === b.startTime &&
          a.endTime === b.endTime &&
          a.absenceReasonId === b.absenceReasonId &&
          a.dayPart === b.dayPart
        );
      }
    );
  });

  return detailsGroupings;
};

const convertAbsenceDetailsToDetailsItem = (
  date: Date,
  details: Maybe<AbsenceDetail>[]
): DetailsItemByDate[] => {
  const detailItems = details.map(d => {
    const startTime = convertStringToDate(d!.startTimeLocal);
    const endTime = convertStringToDate(d!.endTimeLocal);
    if (!startTime || !endTime) {
      return;
    }

    return {
      date: date,
      dayPart: d!.dayPartId,
      startTime: format(startTime, "h:mm a"),
      endTime: format(endTime, "h:mm a"),
      absenceReasonId:
        d!.reasonUsages && d!.reasonUsages[0]
          ? d!.reasonUsages[0].absenceReasonId
          : undefined,
    };
  });
  const populatedItems = detailItems.filter(
    d => d !== undefined && d.absenceReasonId !== undefined
  ) as DetailsItemByDate[];
  return populatedItems;
};
