import {
  Grid,
  makeStyles,
  Typography,
  Link,
  IconButton,
} from "@material-ui/core";
import { Register, SetValue } from "forms";
import { Location } from "graphql/server-types.gen";
import { convertStringToDate, formatDateIfPossible } from "helpers/date";
import * as React from "react";
import { useState } from "react";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";
import { VacancyDetail } from "../types";
import { GetLocationsForEmployee } from "../graphql/get-locations-for-employee.gen";
import { useTranslation } from "react-i18next";
import { HighlightOff } from "@material-ui/icons";
import { Field } from "formik";
import { FormikTimeInput } from "ui/components/form/formik-time-input";

type Props = {
  locationOptions: GetLocationsForEmployee.Locations[];
  // setValue: SetValue;
  keyPrefix: string;
  values: VacancyDetail;
  // register: Register;
  className?: string;
  showRemoveButton: boolean;
  onRemoveRow: () => void;
  onAddRow: () => void;
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  console.log("values?", props.values);
  const classes = useStyles();
  const { t } = useTranslation();
  const locationMenuOptions = props.locationOptions.map(loc => ({
    value: loc.id,
    label: loc.name,
  }));
  const fieldNamePrefix = props.keyPrefix;

  const date = convertStringToDate(props.values.date);

  return (
    <Grid
      container
      className={[classes.rowContainer, props.className].join(" ")}
    >
      <Grid item container>
        <Typography variant="h6">
          {date && formatDateIfPossible(date, "MMMM d, yyyy")}
        </Typography>
      </Grid>

      <Grid item container alignItems="center">
        <Grid item container md={3} className={classes.vacancyBlockItem}>
          <Grid item xs={4} className={classes.timeInput}>
            <FormikTimeInput
              name={`${fieldNamePrefix}.startTime`}
              earliestTime={props.values.startTime}
            />
          </Grid>
          <Grid item xs={4} className={classes.timeInput}>
            <FormikTimeInput
              name={`${fieldNamePrefix}.endTime`}
              earliestTime={props.values.endTime}
            />
          </Grid>
        </Grid>

        <Grid item xs={3} className={classes.vacancyBlockItem}>
          <Select
            name={`${fieldNamePrefix}.locationId`}
            isClearable={false}
            options={locationMenuOptions}
            onChange={async (event: any) => {
              // await props.setValue(
              //   `${fieldNamePrefix}.locationId`,
              //   Number(event.value)
              // );
            }}
            value={{
              value: Number(props.values?.locationId) || undefined,
              label:
                locationMenuOptions.find(
                  op => Number(op.value) === props.values?.locationId
                )?.label || "",
            }}
          />
        </Grid>
        {props.showRemoveButton && (
          <Grid item>
            <IconButton onClick={props.onRemoveRow}>
              <HighlightOff />
            </IconButton>
          </Grid>
        )}
      </Grid>

      <Grid item container>
        <Link onClick={props.onAddRow}>{t("Add row")}</Link>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(2),
  },
  rowContainer: {
    padding: theme.spacing(2),
  },
  timeInput: {
    marginRight: theme.spacing(1),
  },
}));
