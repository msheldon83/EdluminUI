import * as React from "react";
import { Absence } from "graphql/server-types.gen";
import { Grid, makeStyles, Typography, Button } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { CreateAbsenceActions } from "./state";
import { Section } from "ui/components/section";
import { View as AbsenceView } from "ui/components/absence/view";

type Props = {
  orgId: string;
  absence: Absence | undefined;
  dispatch: React.Dispatch<CreateAbsenceActions>;
};

export const Confirmation: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  if (!props.absence) {
    // Redirect the User back to the Absence Details step
    props.dispatch({
      action: "switchStep",
      step: "absence",
    });
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
              {`${t("Confirmation #")} ${props.absence.id}`}
            </Typography>
          </div>
        </Grid>
        <Grid item xs={12} container>
          <AbsenceView
            orgId={props.orgId}
            absence={props.absence}
            isConfirmation={true}
          />
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
}));
