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
import { useQueryBundle } from "graphql/hooks";
import { GetLocationsForEmployee } from "../graphql/get-locations-for-employee.gen";
import { compact } from "lodash-es";
import { getDateRangeDisplayText, convertStringToDate } from "helpers/date";
import { useState } from "react";

type Props = {
  details: VacancyDetail[];
  actingAsEmployee?: boolean;
  positionName?: string;
  employeeName: string;
  onCancel: () => void;
  onChangedVacancies: (data: VacancyDetail[]) => void;
  employeeId: string;
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
  console.log("formValues details", formValues.details);

  const locationQuery = useQueryBundle(GetLocationsForEmployee, {
    variables: { id: props.employeeId },
  });
  const locationOptions: GetLocationsForEmployee.Locations[] =
    (locationQuery.state !== "LOADING" &&
      compact(locationQuery.data.employee?.byId?.locations)) ||
    [];

  // const addRow = React.useCallback(
  //   (detailsToCopy: VacancyDetail, index: number) => {
  //     console.log("add at", index, "this object", detailsToCopy);
  //     const updated = formValues.details.splice(index, 0, detailsToCopy);
  //   },
  //   [formValues.details]
  // );
  // const onRemoveRow = React.useCallback(
  //   (index: number) => {
  //     formValues.details.splice(index, 1);
  //   },
  //   [formValues.details]
  // );

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
            <Typography variant="h5">
              {getDateRangeDisplayText(
                convertStringToDate(props.details[0].date),
                convertStringToDate(
                  props.details[props.details.length - 1].date
                )
              )}
              {props.positionName && ` - ${props.positionName}`}
            </Typography>
            <Divider className={classes.divider} />
          </Grid>
        </Grid>

        {formValues.details.map((d, i) => (
          <Grid key={i} container className={classes.rowSpacing}>
            <EditableVacancyDetailRow
              locationOptions={locationOptions}
              setValue={setValue}
              keyPrefix={`details[${i}]`}
              values={d}
              register={registerEditForm}
              className={i % 2 == 1 ? classes.shadedRow : undefined}
              // onRemoveRow={() => onRemoveRow(i)}
              // onAddRow={() => addRow(d, i + 1)}
              showRemoveButton={formValues.details.length > 1}
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
