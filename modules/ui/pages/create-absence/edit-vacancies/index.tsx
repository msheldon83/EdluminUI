import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import {
  Location,
  VacancyDetailInput,
  Vacancy,
} from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Step } from "../step-params";
import { CreateAbsenceFormData } from "../ui";
import { EditableVacancyDetails } from "../vacancy-details/editable-vacancy-details";
import { SetValue, Register } from "forms";
import { flatMap, compact } from "lodash-es";

type Props = {
  vacancies: Vacancy[];
  actingAsEmployee?: boolean;
  positionName?: string;
  employeeName: string;
  setStep: (S: Step) => void;
  setValue: SetValue;
  handleSubmit: () => void;
  register: Register;
  values: CreateAbsenceFormData;
};

export const EditVacancies: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const initialFormData: VacancyDetailInput[] = flatMap(
    props.vacancies.map((vacancy: Vacancy) => {
      return compact(
        vacancy.details &&
          vacancy.details.map(d => {
            const i: VacancyDetailInput | null =
              d && d.locationId
                ? {
                    startTime: d.startTimeLocal,
                    endTime: d.endTimeLocal,
                    locationId: d.locationId,
                  }
                : null;
            return i;
          })
      );
    })
  );

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
          values={props.values}
          setValue={props.setValue}
          register={props.register}
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
            <Button onClick={() => props.handleSubmit()} variant="contained">
              {t("Save")}
            </Button>
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
