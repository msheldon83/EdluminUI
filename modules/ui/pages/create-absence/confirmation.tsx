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
import { Step } from "./step-params";
import { EmployeeChromeRoute, AdminChromeRoute } from "ui/routes/app-chrome";
import {
  AdminEditAbsenceRoute,
  EmployeeEditAbsenceRoute,
} from "ui/routes/edit-absence";
import { useMemo } from "react";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  isAdmin: boolean;
  setStep?: (s: Step) => void;
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const history = useHistory();
  const params = useRouteParams(
    props.isAdmin
      ? AdminSelectEmployeeForCreateAbsenceRoute
      : EmployeeCreateAbsenceRoute
  );

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { absence, isAdmin, orgId } = props;
  const editUrl = useMemo(() => {
    if (!absence) {
      return "";
    }

    const url = isAdmin
      ? AdminEditAbsenceRoute.generate({
          ...params,
          organizationId: orgId,
          absenceId: absence.id,
        })
      : EmployeeEditAbsenceRoute.generate({
          ...params,
          absenceId: absence.id,
        });
    return url;
  }, [params, absence, isAdmin, orgId]);

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
            isAdmin={isAdmin}
            goToEdit={() => history.push(editUrl)}
          />
        </Grid>
        <Grid item xs={12} container justify="flex-end" spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              component={Link}
              to={
                isAdmin
                  ? AdminSelectEmployeeForCreateAbsenceRoute.generate({
                      ...params,
                      organizationId: orgId,
                    })
                  : EmployeeCreateAbsenceRoute.generate(params)
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
                isAdmin
                  ? AdminChromeRoute.generate({
                      ...params,
                      organizationId: orgId,
                    })
                  : EmployeeChromeRoute.generate(params)
              }
            >
              {isAdmin ? t("Back to List") : t("Back to Home")}
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
