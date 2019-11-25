import { Button, Grid, makeStyles, Typography } from "@material-ui/core";
import { useForm } from "forms";
import { AbsenceVacancyInput, Location } from "graphql/server-types.gen";
import { compact } from "lodash-es";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { GetProjectedVacancies } from "../graphql/get-projected-vacancies.gen";
import { EditableVacancyDetails } from "./editable-vacancy-details";
import { VacancyDetail } from "../types";

type Props = {
  details: VacancyDetail[];
  actingAsEmployee?: boolean;
  positionName?: string;
  employeeName: string;
  onCancel: () => void;
  onChangedVacancies: (data: VacancyDetail[]) => void;
};

type EditVacancyFormData = {
  details: VacancyDetail[];
};

export const EditVacancies: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const initialFormData: EditVacancyFormData = { details: props.details };
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
    <form
      onSubmit={handleSubmit((data, e) => {
        console.log("vacancy form submit", data);
        props.onChangedVacancies(props.details);
      })}
    >
      <Typography variant={props.actingAsEmployee ? "h1" : "h5"}>
        {`${t("Create Absence")}: ${t("Editing Substitute Details")}`}
      </Typography>
      {!props.actingAsEmployee && (
        <Typography variant="h1">{props.employeeName}</Typography>
      )}

      <Section className={classes.vacancyDetails}>
        <EditableVacancyDetails
          projectedVacancies={props.details}
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
            <Button onClick={props.onCancel} variant="outlined">
              {t("Cancel")}
            </Button>
          </Grid>
          <Grid item>
            <Button type={"submit"} variant="contained">
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
