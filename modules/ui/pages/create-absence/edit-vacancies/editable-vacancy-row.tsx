import { Grid, makeStyles } from "@material-ui/core";
import { Register, SetValue } from "forms";
import { Location, VacancyDetailInput } from "graphql/server-types.gen";
import * as React from "react";
import { useState } from "react";
import { VacancyDetailsItem } from "ui/components/absence/helpers";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";
import { VacancyDetail } from "../types";

type Props = {
  locationOptions: Location[];
  setValue: SetValue;
  keyPrefix: string;
  values: VacancyDetail;
  register: Register;
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

  const [startTime, setStartTime] = useState(props.values.startTime);
  const [endTime, setEndTime] = useState(props.values.endTime);

  return (
    <Grid container>
      <Grid item container md={} className={classes.vacancyBlockItem}>
        <Grid item>
          <TimeInput
            label=""
            name={`${fieldNamePrefix}.startTime`}
            value={startTime}
            onValidTime={async value => {
              setStartTime(value);
              await props.setValue(`${fieldNamePrefix}.startTime`, value);
            }}
            onChange={async value => {
              setStartTime(value);
            }}
            earliestTime={startTime}
          />
        </Grid>
        <Grid item>
          <TimeInput
            label=""
            name={`${fieldNamePrefix}.endTime`}
            value={endTime}
            onValidTime={async value => {
              setEndTime(value);
              await props.setValue(`${fieldNamePrefix}.endTime`, value);
            }}
            onChange={async value => {
              setEndTime(value);
            }}
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
}));
