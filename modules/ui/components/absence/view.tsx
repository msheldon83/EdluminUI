import * as React from "react";
import {
  Grid,
  makeStyles,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@material-ui/core";
import { Absence, Vacancy, AbsenceReason } from "graphql/server-types.gen";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { VacancyDetails } from "./vacancy-details";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { DatePicker } from "../form/date-picker";

type Props = {
  orgId: string;
  absence: Absence | undefined;
};

export const View: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const absenceReasons = useAbsenceReasons(props.orgId);
  const absence = props.absence;

  if (!absence) {
    return null;
  }

  const getAbsenceReasonListDisplay = (
    totalNumberOfDays: number | null | undefined
  ) => {
    if (!props.absence || !props.absence.details) {
      return null;
    }

    const numberOfDaysText = totalNumberOfDays
      ? `  (${totalNumberOfDays} ${
          totalNumberOfDays === 1 ? t("day") : t("days")
        })`
      : "";

    return props.absence.details.map((d, i) => {
      /* TODO: Currently we are assuming that there is only 1 Absence Reason in
          use per Absence Detail. As we build in support for my complicated
          Absences, we will have to revisit this.
      */
      const matchingAbsenceReason = absenceReasons.find(
        (a: Pick<AbsenceReason, "id" | "name">) =>
          d &&
          d.reasonUsages &&
          d.reasonUsages[0] &&
          a.id === d.reasonUsages[0].absenceReasonId.toString()
      );
      if (matchingAbsenceReason) {
        return (
          <div
            key={i}
          >{`${matchingAbsenceReason.name}${numberOfDaysText}`}</div>
        );
      }
    });
  };

  const hasVacancies = absence.vacancies && absence.vacancies.length;
  const notesToReplacement =
    absence.vacancies && absence.vacancies[0]
      ? absence.vacancies[0].notesToReplacement
      : undefined;

  return (
    <Grid container>
      <Grid item xs={hasVacancies ? 5 : 12} container>
        <Grid item xs={12}>
          <Typography variant="h5">{t("Absence Details")}</Typography>
        </Grid>
        <Grid item xs={12}>
          <DatePicker
            startDate={new Date(`${absence.startDate} 00:00`)}
            endDate={new Date(`${absence.endDate} 00:00`)}
            onChange={() => {}}
            startLabel=""
            endLabel=""
            disabled={true}
          />
          {/* <Typography variant={"h6"}>{t("Reason")}:</Typography>
          {getAbsenceReasonListDisplay(absence.numDays)} */}
          <div className={classes.notesToApproverSection}>
            <Typography variant={"h6"}>
              {t("Notes for administrator")}:
            </Typography>
            <Typography className={classes.subText}>
              {t("Can be seen by the administrator and the employee.")}
            </Typography>
            <div>
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
            <Section className={classes.vacancyDetailsSection}>
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
              {/* {props.preAssignedReplacementEmployeeName && (
            <div className={classes.preArrangedChip}>
              <Chip
                label={`${t("Pre-arranged")}: ${
                  props.preAssignedReplacementEmployeeName
                }`}
                color={"primary"}
              />
            </div>
          )} */}
              <div className={classes.notesForSubSection}>
                <Typography variant={"h6"}>
                  {t("Notes for substitute")}:
                </Typography>
                <Typography className={classes.subText}>
                  {t(
                    "Can be seen by the administrator and the employee as well as the assigned substitute."
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
            </Section>
          </Grid>
        </Grid>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  confirmationBanner: {
    textAlign: "center",
    color: theme.customColors.white,
    backgroundColor: "#099E47",
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  confirmationText: {
    marginTop: theme.spacing(2),
  },
  vacancyDetailsSection: {
    padding: theme.spacing(2),
  },
  notesToApproverSection: {
    marginTop: theme.spacing(2),
  },
  requiresSubSection: {
    marginTop: theme.spacing(2),
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
  valueMissing: {
    fontWeight: "normal",
    opacity: "0.6",
    filter: "alpha(opacity = 60)",
  },
}));
