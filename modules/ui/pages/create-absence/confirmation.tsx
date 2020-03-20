import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Absence } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Link, useHistory } from "react-router-dom";
import { View as AbsenceView } from "ui/components/absence/view";
import { Section } from "ui/components/section";
import {
  AdminSelectEmployeeForCreateAbsenceRoute,
  EmployeeCreateAbsenceRoute,
} from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { Step } from "../../../helpers/step-params";
import { EmployeeChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import {
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/edit-absence";
import { useMemo } from "react";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  actingAsEmployee?: boolean;
  setStep?: (s: Step) => void;
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const { absence, actingAsEmployee, orgId } = props;

  const params = useRouteParams(
    actingAsEmployee
      ? EmployeeCreateAbsenceRoute
      : AdminSelectEmployeeForCreateAbsenceRoute
  );

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const editUrl = useMemo(() => {
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

  if (!absence) {
    // Redirect the User back to the Absence Details step
    props.setStep && props.setStep("absence");

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
            isConfirmation={true}
            actingAsEmployee={actingAsEmployee}
            goToEdit={() => history.push(editUrl)}
          />
        </Grid>
        <Grid item xs={12} container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to={
                actingAsEmployee
                  ? EmployeeCreateAbsenceRoute.generate(params)
                  : AdminSelectEmployeeForCreateAbsenceRoute.generate({
                      ...params,
                      organizationId: orgId,
                    })
              }
            >
              {t("Create New")}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to={
                actingAsEmployee
                  ? EmployeeChromeRoute.generate(params)
                  : AdminChromeRoute.generate({
                      ...params,
                      organizationId: orgId,
                    })
              }
            >
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
