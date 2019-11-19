import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
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
import { CreateAbsenceActions } from "./state";
import { Section } from "ui/components/section";
import { VacancyDetails } from "./vacancy-details";

type Props = {
  absenceId: string | undefined;
  totalNumberOfDays: number;
  dispatch: React.Dispatch<CreateAbsenceActions>;
  vacancies?: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
  needsReplacement: boolean;
  absenceReasonName: string;
  notesToApprover?: string;
  notesToSubstitute?: string;
  preAssignedReplacementEmployeeName?: string;
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const isMobile = useScreenSize() === "mobile";

  if (!props.absenceId) {
    // Redirect the User back to the Absence Details step
    props.dispatch({
      action: "switchStep",
      step: "absence",
    });
  }

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
              {`${t("Confirmation #")} ${props.absenceId}`}
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
          <div>
            {`${props.absenceReasonName} (${props.totalNumberOfDays} ${
              props.totalNumberOfDays === 1 ? t("day") : t("days")
            })`}
          </div>
          <div className={classes.notesToApproverSection}>
            <Typography variant={"h6"}>{t("Notes")}:</Typography>
            <div>
              {props.notesToApprover || (
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
