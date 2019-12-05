import {
  Grid,
  IconButton,
  Link,
  makeStyles,
  Typography,
} from "@material-ui/core";
import { HighlightOff } from "@material-ui/icons";
import { convertStringToDate, formatDateIfPossible } from "helpers/date";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FormikSelect } from "ui/components/form/formik-select";
import { FormikTimeInput } from "ui/components/form/formik-time-input";
import { GetLocationsForEmployee } from "../graphql/get-locations-for-employee.gen";
import { VacancyDetail } from "../types";

type Props = {
  locationOptions: GetLocationsForEmployee.Locations[];
  keyPrefix: string;
  values: VacancyDetail;
  className?: string;
  showRemoveButton: boolean;
  onRemoveRow: () => void;
  onAddRow: () => void;
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const locationMenuOptions = props.locationOptions.map(loc => ({
    value: Number(loc.id),
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
            <FormikTimeInput name={`${fieldNamePrefix}.startTime`} />
          </Grid>
          <Grid item xs={4} className={classes.timeInput}>
            <FormikTimeInput
              name={`${fieldNamePrefix}.endTime`}
              earliestTime={props.values.startTime}
            />
          </Grid>
        </Grid>

        <Grid item xs={3} className={classes.vacancyBlockItem}>
          <FormikSelect
            name={`${fieldNamePrefix}.locationId`}
            isClearable={false}
            options={locationMenuOptions}
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