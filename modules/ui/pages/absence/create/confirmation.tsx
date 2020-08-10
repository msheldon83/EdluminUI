import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Absence } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { Step } from "helpers/step-params";
import { AbsenceView } from "../components/absence-view";
import {
  AdminSelectEmployeeForCreateAbsenceRoute,
  AdminEditAbsenceRoute,
  EmployeeCreateAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/absence";
import { compact, flatMap } from "lodash-es";
import { AssignmentOnDate } from "../types";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  actingAsEmployee?: boolean;
  setStep?: (s: Step) => void;
  resetForm?: () => void;
  onCancelAssignment?: (
    vacancySummaryDetails: VacancySummaryDetail[]
  ) => Promise<boolean>;
  assignmentsByDate?: AssignmentOnDate[];
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const {
    absence,
    actingAsEmployee,
    orgId,
    setStep,
    resetForm,
    onCancelAssignment,
    assignmentsByDate = [],
  } = props;

  const params = useRouteParams(
    actingAsEmployee
      ? EmployeeCreateAbsenceRoute
      : AdminSelectEmployeeForCreateAbsenceRoute
  );

  React.useEffect(() => {
    const container = document.getElementById("main-container");
    if (container) container.scrollTop = 0;
  }, []);

  const editUrl = React.useMemo(() => {
    if (!absence) {
      return "";
    }

    const url = actingAsEmployee
      ? EmployeeEditAbsenceRoute.generate({
          ...params,
          absenceId: absence.id,
        })
      : AdminEditAbsenceRoute.generate({
          ...params,
          organizationId: orgId,
          absenceId: absence.id,
        });
    return url;
  }, [params, absence, actingAsEmployee, orgId]);

  const createNewUrl = React.useMemo(() => {
    const url = actingAsEmployee
      ? EmployeeCreateAbsenceRoute.generate(params)
      : AdminSelectEmployeeForCreateAbsenceRoute.generate({
          ...params,
          organizationId: orgId,
        });
    return url;
  }, [actingAsEmployee, orgId, params]);

  const homeUrl = React.useMemo(() => {
    const url = actingAsEmployee
      ? EmployeeChromeRoute.generate(params)
      : AdminChromeRoute.generate({
          ...params,
          organizationId: orgId,
        });
    return url;
  }, [actingAsEmployee, orgId, params]);

  if (!absence) {
    // Redirect the User back to the Absence Details step
    setStep && setStep("absence");
    return null;
  }

  return (
    <Section>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <div className={classes.confirmationBanner}>
            <div>
              {t("Your absence has been saved. We'll take it from here.")}
            </div>
            <Typography variant="h1" className={classes.confirmationText}>
              {`${t("Confirmation #")} ${absence.id}`}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} container>
          <AbsenceView
            absence={absence}
            actingAsEmployee={actingAsEmployee}
            assignmentsByDate={assignmentsByDate}
            onCancelAssignment={
              onCancelAssignment
                ? async (vacancySummaryDetails: VacancySummaryDetail[]) => {
                    const isSuccess = await onCancelAssignment(
                      vacancySummaryDetails
                    );
                    const assignmentId =
                      vacancySummaryDetails[0]?.assignment?.id;
                    if (isSuccess && vacancySummaryDetails.length > 0) {
                      // If Sub was only removed from part of the Assignment, then we'll
                      // redirect the User directly to the Edit view of the Absence
                      const allVacancyDetails = flatMap(
                        compact(absence.vacancies ?? []).map(v => v.details)
                      );
                      const vacancyDetailsForThisAssignment = allVacancyDetails.filter(
                        d => d.assignmentId && d.assignmentId === assignmentId
                      );
                      if (
                        vacancySummaryDetails.length !==
                        vacancyDetailsForThisAssignment.length
                      ) {
                        history.push(editUrl);
                      }
                    }
                    return isSuccess;
                  }
                : undefined
            }
          />
        </Grid>
        <Grid item xs={12} container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to={createNewUrl}
              onClick={resetForm}
            >
              {t("Create New")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to={homeUrl}>
              {actingAsEmployee ? t("Back to Home") : t("Back to List")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="outlined" component={Link} to={editUrl}>
              {t("Edit")}
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
}));
