import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { Location } from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Step } from "../step-params";
import { VacancyData } from "../ui";
import { EditableVacancyDetails } from "../vacancy-details/editable-vacancy-details";

type Props = {
  vacancies: VacancyData[];
  actingAsEmployee?: boolean;
  positionName?: string;
  employeeName: string;
  setStep: (S: Step) => void;
};

export const EditVacancies: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Typography variant={props.actingAsEmployee ? "h1" : "h5"}>
        {`${t("Create Absence")}: ${t("Editing Substitute Details")}`}
      </Typography>
      {!props.actingAsEmployee && (
        <Typography variant="h1">{props.employeeName}</Typography>
      )}

      <Section className={classes.vacancyDetails}>
        <EditableVacancyDetails
          vacancies={props.vacancies}
          showHeader
          positionName={props.positionName}
          locationOptions={[
            { id: "10", name: "Elementary school abc" } as Location,
            { id: "11", name: "Middle school" } as Location,
            { id: "12", name: "High school" } as Location,
          ]}
        />
        <Grid container justify="flex-end">
          <Grid item>
            <Button onClick={() => props.setStep("absence")} variant="outlined">
              {t("Cancel")}
            </Button>
          </Grid>
          <Grid item>
            <Button variant="contained">{t("Save")}</Button>
          </Grid>
        </Grid>
      </Section>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyDetails: {
    marginTop: theme.spacing(3),
  },
  divider: {
    marginTop: theme.spacing(3),
  },
}));
