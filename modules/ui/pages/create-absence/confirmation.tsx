import * as React from "react";
import { Absence, Vacancy, AbsenceReason } from "graphql/server-types.gen";
import {
  Grid,
  makeStyles,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Chip,
} from "@material-ui/core";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { useAbsenceReasons } from "reference-data/absence-reasons";
import { VacancyDetails } from "./absence-details/vacancy-details";
import { Step } from "./step-params";

type Props = {
  orgId: string;
  absence:
    | Pick<
        Absence,
        "id" | "employeeId" | "numDays" | "notesToApprover" | "details"
      >
    | undefined;
  vacancies?: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  needsReplacement: boolean;
  notesToSubstitute?: string;
  preAssignedReplacementEmployeeName?: string;
  setStep: (s: Step) => void;
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";
  const absenceReasons = useAbsenceReasons(props.orgId);

  if (!props.absence) {
    // Redirect the User back to the Absence Details step
    props.setStep("absence");

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

  const hasVacancies = props.vacancies && props.vacancies.length;

  return (
    <Section>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div className={classes.confirmationBanner}>
            <div>
              {t("Your absence has been saved. We'll take it from here.")}
            </div>
            <Typography variant="h1" className={classes.confirmationText}>
              {`${t("Confirmation #")} ${props.absence.id}`}
            </Typography>
          </div>
        </Grid>
        {hasVacancies && (
          <Grid item xs={5}>
            <Section className={classes.vacancyDetailsSection}>
              <VacancyDetails
                vacancies={props.vacancies ?? []}
                equalWidthDetails
              />
              <div className={classes.requiresSubSection}>
                <FormControlLabel
                  label={t("Requires a substitute")}
                  control={
                    <Checkbox
                      checked={props.needsReplacement}
                      disabled={true}
                    />
                  }
                />
              </div>
              {props.preAssignedReplacementEmployeeName && (
                <div className={classes.preArrangedChip}>
                  <Chip
                    label={`${t("Pre-arranged")}: ${
                      props.preAssignedReplacementEmployeeName
                    }`}
                    color={"primary"}
                  />
                </div>
              )}
            </Section>
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
                {props.notesToSubstitute || (
                  <span className={classes.valueMissing}>
                    {t("No Notes Specified")}
                  </span>
                )}
              </div>
            </div>
          </Grid>
        )}
        <Grid item xs={hasVacancies ? 7 : 12}>
          <Typography variant={"h6"}>{t("Reason")}:</Typography>
          {getAbsenceReasonListDisplay(props.absence.numDays)}
          <div className={classes.notesToApproverSection}>
            <Typography variant={"h6"}>{t("Notes")}:</Typography>
            <div>
              {props.absence.notesToApprover || (
                <span className={classes.valueMissing}>
                  {t("No Notes Specified")}
                </span>
              )}
            </div>
          </div>
        </Grid>
        <Grid item xs={12} container justify="flex-end" spacing={2}>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={() => {}}>
              {t("Create New")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" color="primary" onClick={() => {}}>
              {t("Back to List")}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </Section>
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
