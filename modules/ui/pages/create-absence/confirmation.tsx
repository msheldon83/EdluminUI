import * as React from "react";
import { Vacancy } from "graphql/server-types.gen";
import { Grid, makeStyles } from "@material-ui/core";
import { useScreenSize } from "hooks";
import { useTranslation } from "react-i18next";
import { CreateAbsenceActions } from "./state";

type Props = {
  absenceId: string | undefined;
  dispatch: React.Dispatch<CreateAbsenceActions>;
  vacancies?: Pick<
    Vacancy,
    "startTimeLocal" | "endTimeLocal" | "numDays" | "positionId" | "details"
  >[];
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

  return (
    <Grid container>
      <Grid item xs={12}>
        <div className={classes.confirmationBanner}>
          <div>
            {t("Your absence has been saved. We'll take it from here.")}
          </div>
          <div>{`${t("Confirmation #")} ${props.absenceId}`}</div>
        </div>
      </Grid>
      <Grid item xs={12}>
        Buttons here
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  confirmationBanner: {
    textAlign: "center",
    color: theme.customColors.white,
    backgroundColor: "#099E47",
  },
}));
