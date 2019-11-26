import {
  Button,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { useForm } from "forms";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { VacancyDetail } from "../types";
import { EditableVacancyDetailRow } from "./editable-vacancy-row";

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
  console.log("formValues", formValues);

  return (
    <form
      onSubmit={handleSubmit((data, e) => {
        console.log("vacancy form submit", data);
        props.onChangedVacancies(data.details);
      })}
    >
      <Typography variant={props.actingAsEmployee ? "h1" : "h5"}>
        {`${t("Create Absence")}: ${t("Editing Substitute Details")}`}
      </Typography>
      {!props.actingAsEmployee && (
        <Typography variant="h1">{props.employeeName}</Typography>
      )}

      <Section className={classes.vacancyDetails}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            this is the header
            <Divider className={classes.divider} />
          </Grid>
        </Grid>

        {formValues.details.map((d, i) => (
          <Grid key={i} container className={classes.rowSpacing}>
            <EditableVacancyDetailRow
              locationOptions={[]}
              setValue={setValue}
              keyPrefix={`details[${i}]`}
              values={d}
              register={registerEditForm}
              className={i % 2 == 1 ? classes.shadedRow : undefined}
            />
            {/* {i},{d.date},{d.startTime},{d.endTime},{d.locationId} */}
          </Grid>
        ))}

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
  shadedRow: {
    backgroundColor: theme.customColors.lightGray,
  },
  rowSpacing: {
    marginBottom: theme.spacing(2),
  },
}));
