import { Grid, makeStyles } from "@material-ui/core";
import { Register, SetValue } from "forms";
import { Location, Maybe, VacancyDetail } from "graphql/server-types.gen";
import { convertStringToDate } from "helpers/date";
import * as React from "react";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";
import { CreateAbsenceFormData } from "../ui";

type Props = {
  vacancyDetails: Maybe<VacancyDetail>[];
  equalWidthDetails?: boolean;
  locationOptions: Location[];
  setValue: SetValue;
  groupIndex: number;
  register: Register;
  values: CreateAbsenceFormData;
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const locationMenuOptions = props.locationOptions.map(loc => ({
    value: loc.id,
    label: loc.name,
  }));

  const firstDetail =
    props.values.vacancies &&
    props.values.vacancies[0] &&
    props.values.vacancies[0].details &&
    props.values.vacancies[0].details[0];

  if (!firstDetail) {
    return <></>;
  }
  const detailStartTimeLocal = convertStringToDate(
    firstDetail.startTime
  )?.toISOString();
  const detailEndTimeLocal = convertStringToDate(
    firstDetail.endTime
  )?.toISOString();
  if (!detailStartTimeLocal || !detailEndTimeLocal) {
    return <></>;
  }

  const fieldNamePrefix = `vacancies[${props.groupIndex}].details`;
  props.register({ name: `${fieldNamePrefix}.locationId`, type: "custom" });

  return (
    <>
      <Grid item className={classes.vacancyBlockItem}>
        <Grid item>
          <TimeInput
            label=""
            name={`${fieldNamePrefix}.startTime`}
            value={detailStartTimeLocal}
            onValidTime={async value => {
              await props.setValue(`${fieldNamePrefix}.startTime`, value);
              console.log(value);
            }}
            onChange={async value => {
              await props.setValue(`${fieldNamePrefix}.startTime`, value);
              console.log(value);
            }}
            earliestTime={detailStartTimeLocal}
            ref={props.register}
          />
        </Grid>
        <Grid item>
          <TimeInput
            label=""
            name={`${fieldNamePrefix}.endTime`}
            value={detailEndTimeLocal}
            onValidTime={async value => {
              await props.setValue(`${fieldNamePrefix}.endTime`, value);
              console.log(value);
            }}
            onChange={async value => {
              await props.setValue(`${fieldNamePrefix}.endTime`, value);
              console.log(value);
            }}
            earliestTime={detailEndTimeLocal}
            ref={props.register}
          />
        </Grid>
      </Grid>

      <Grid item xs={3} className={classes.vacancyBlockItem}>
        <Select
          name={`${fieldNamePrefix}.locationId`}
          options={locationMenuOptions}
          onChange={async (event: any) => {
            console.log(`${fieldNamePrefix}.locationId`, event.value);
            await props.setValue(`${fieldNamePrefix}.locationId`, event.value);
          }}
          value={{
            value: firstDetail.locationId,
            label:
              locationMenuOptions.find(
                op => Number(op.value) === firstDetail.locationId
              )?.label || "",
          }}
        />
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
    marginRight: theme.spacing(2),
  },
}));
