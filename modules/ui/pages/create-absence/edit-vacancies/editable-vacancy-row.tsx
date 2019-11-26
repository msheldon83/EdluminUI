import { Grid, makeStyles, Typography } from "@material-ui/core";
import { Register, SetValue } from "forms";
import { Location } from "graphql/server-types.gen";
import { convertStringToDate, formatDateIfPossible } from "helpers/date";
import * as React from "react";
import { useState } from "react";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";
import { VacancyDetail } from "../types";

type Props = {
  locationOptions: Location[];
  setValue: SetValue;
  keyPrefix: string;
  values: VacancyDetail;
  register: Register;
  className?: string;
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  console.log("values?", props.values);
  const classes = useStyles();
  const locationMenuOptions = props.locationOptions.map(loc => ({
    value: loc.id,
    label: loc.name,
  }));
  const fieldNamePrefix = props.keyPrefix;
  props.register(
    { name: `${fieldNamePrefix}.locationId`, type: "custom" },
    { required: "Required" }
  );
  props.register(
    { name: `${fieldNamePrefix}.startTime`, type: "custom" },
    { required: "Required" }
  );
  props.register(
    { name: `${fieldNamePrefix}.endTime`, type: "custom" },
    { required: "Required" }
  );

  const [startTime, setStartTime] = useState(
    convertStringToDate(props.values.startTime)?.toISOString()
  );
  const [endTime, setEndTime] = useState(
    convertStringToDate(props.values.endTime)?.toISOString()
  );
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
      <Grid item container md={3} className={classes.vacancyBlockItem}>
        <Grid item xs={4} className={classes.timeInput}>
          <TimeInput
            label=""
            name={`${fieldNamePrefix}.startTime`}
            value={startTime}
            onValidTime={async value => {
              setStartTime(value);
              await props.setValue(`${fieldNamePrefix}.startTime`, value);
            }}
            onChange={value => setStartTime(value)}
            earliestTime={startTime}
          />
        </Grid>
        <Grid item xs={4} className={classes.timeInput}>
          <TimeInput
            label=""
            name={`${fieldNamePrefix}.endTime`}
            value={endTime}
            onValidTime={async value => {
              setEndTime(value);
              await props.setValue(`${fieldNamePrefix}.endTime`, value);
            }}
            onChange={value => setEndTime(value)}
            earliestTime={endTime}
          />
        </Grid>
      </Grid>

      <Grid item xs={3} className={classes.vacancyBlockItem}>
        <Select
          name={`${fieldNamePrefix}.locationId`}
          isClearable={false}
          options={locationMenuOptions}
          onChange={async (event: any) => {
            await props.setValue(
              `${fieldNamePrefix}.locationId`,
              Number(event.value)
            );
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
