import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Absence } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { Section } from "ui/components/section";
import { useRouteParams } from "ui/routes/definition";
import { EmployeeChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import { useMemo } from "react";
import { Step } from "helpers/step-params";
import { AbsenceView } from "../components/absence-view";
import {
  AdminSelectEmployeeForCreateAbsenceRouteV2,
  AdminEditAbsenceRouteV2,
  EmployeeCreateAbsenceRouteV2,
  EmployeeEditAbsenceRouteV2,
} from "ui/routes/absence-v2";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  actingAsEmployee?: boolean;
  setStep?: (s: Step) => void;
  resetForm?: () => void;
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { absence, actingAsEmployee, orgId, setStep, resetForm } = props;

  const params = useRouteParams(
    actingAsEmployee
      ? EmployeeCreateAbsenceRouteV2
      : AdminSelectEmployeeForCreateAbsenceRouteV2
  );

  React.useEffect(() => {
    const container = document.getElementById("main-container");
    if (container) container.scrollTop = 0;
  }, []);

  const editUrl = useMemo(() => {
    if (!absence) {
      return "";
    }

    const url = actingAsEmployee
      ? EmployeeEditAbsenceRouteV2.generate({
          ...params,
          absenceId: absence.id,
        })
      : AdminEditAbsenceRouteV2.generate({
          ...params,
          organizationId: orgId,
          absenceId: absence.id,
        });
    return url;
  }, [params, absence, actingAsEmployee, orgId]);

  const createNewUrl = useMemo(() => {
    const url = actingAsEmployee
      ? EmployeeCreateAbsenceRouteV2.generate(params)
      : AdminSelectEmployeeForCreateAbsenceRouteV2.generate({
          ...params,
          organizationId: orgId,
        });
    return url;
  }, [actingAsEmployee, orgId, params]);

  const homeUrl = useMemo(() => {
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
            orgId={orgId}
            absence={absence}
            actingAsEmployee={actingAsEmployee}
            goToEdit={() => history.push(editUrl)}
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
