import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import {
  Location,
  VacancyDetailInput,
  Vacancy,
  AbsenceVacancyInput,
} from "graphql/server-types.gen";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { Step } from "../step-params";
import { CreateAbsenceFormData } from "../ui";
import { EditableVacancyDetails } from "./editable-vacancy-details";
import { SetValue, Register } from "forms";
import { flatMap, compact } from "lodash-es";
import { useForm } from "forms";

type Props = {
  vacancies: Vacancy[];
  actingAsEmployee?: boolean;
  positionName?: string;
  employeeName: string;
  setStep: (S: Step) => void;
  // setValue: SetValue;
  handleSubmit: () => void;
};

export type EditVacancyFormData = {
  vacancies: AbsenceVacancyInput[];
};

export const EditVacancies: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const inputs: AbsenceVacancyInput[] = props.vacancies.map(v => ({
    positionId: v.positionId,
    details: compact(
      v.details?.map(d => {
        if (!d || !d.locationId) {
          return null;
        } else {
          return {
            locationId: d.locationId,
            date: d?.startDate,
            startTime: d?.startTimeLocal,
            endTime: d?.endTimeLocal,
          };
        }
      })
    ),
  }));

  const initialFormData: EditVacancyFormData = { vacancies: inputs };
  console.log("initial form data edit", initialFormData);

  const {
    register: registerEditForm,
    handleSubmit,
    setValue,
    formState,
    getValues,
    errors,
  } = useForm<EditVacancyFormData>({ defaultValues: initialFormData });
  const formValues = getValues({ nest: true });
  console.log("updated", formValues);
  return (
    <form onSubmit={handleSubmit((data, e) => console.log(data))}>
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
          values={formValues}
          register={registerEditForm}
          setValue={setValue}
          locationOptions={[
            { id: "10", name: "Elementary school abc" } as Location,
            { id: "11", name: "Middle school" } as Location,
            { id: "12", name: "High school" } as Location,
            { id: "1013", name: "School" } as Location,
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
    </form>
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
