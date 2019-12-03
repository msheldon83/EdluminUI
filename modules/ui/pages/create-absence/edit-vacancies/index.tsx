import {
  Button,
  Divider,
  Grid,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { FieldArray, Formik } from "formik";
import { useQueryBundle } from "graphql/hooks";
import { convertStringToDate, getDateRangeDisplayText } from "helpers/date";
import { compact } from "lodash-es";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { GetLocationsForEmployee } from "../graphql/get-locations-for-employee.gen";
import { VacancyDetail } from "../types";
import { EditableVacancyDetailRow } from "./editable-vacancy-row";

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

  const initialFormData: EditVacancyFormData = {
    details: props.details.map(d => ({
      ...d,
      locationId: Number(d.locationId),
    })),
  };

  const locationQuery = useQueryBundle(GetLocationsForEmployee, {
    variables: { id: props.employeeId },
  });
  const locationOptions: GetLocationsForEmployee.Locations[] =
    (locationQuery.state !== "LOADING" &&
      compact(locationQuery.data.employee?.byId?.locations)) ||
    [];

  return (
    <Formik
      initialValues={initialFormData}
      onSubmit={(values: EditVacancyFormData) => {
        props.onChangedVacancies(values.details);
      }}
    >
      {({ values, handleSubmit }) => (
        <form onSubmit={handleSubmit}>
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

            <FieldArray
              name="details"
              render={arrayHelpers =>
                values.details.map((d, i) => (
                  <Grid key={i} container className={classes.rowSpacing}>
                    <EditableVacancyDetailRow
                      locationOptions={locationOptions}
                      keyPrefix={`details.${i}`}
                      values={d}
                      className={i % 2 == 1 ? classes.shadedRow : undefined}
                      onAddRow={() => arrayHelpers.insert(i + 1, d)}
                      onRemoveRow={() => arrayHelpers.remove(i)}
                      showRemoveButton={mulitpleDetailsForDate(
                        values.details,
                        d
                      )}
                    />
                  </Grid>
                ))
              }
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
      )}
    </Formik>
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

const mulitpleDetailsForDate = (details: VacancyDetail[], d: VacancyDetail) => {
  return details.filter(detail => detail.date === d.date).length > 1;
};
