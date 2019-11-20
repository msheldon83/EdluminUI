import { Grid, makeStyles } from "@material-ui/core";
import { format } from "date-fns";
import { VacancyDetail, Maybe, Location } from "graphql/server-types.gen";
import { convertStringToDate } from "helpers/date";
import * as React from "react";
import { Select } from "ui/components/form/select";
import { TimeInput } from "ui/components/form/time-input";

type Props = {
  vacancyDetails: Maybe<VacancyDetail>[];
  equalWidthDetails?: boolean;
  locationOptions: Location[];
};

export const EditableVacancyDetailRow: React.FC<Props> = props => {
  const classes = useStyles();
  const locationMenuOptions = props.locationOptions.map(loc => ({
    value: loc.id,
    label: loc.name,
  }));

  const firstDetail = props.vacancyDetails[0];
  if (!firstDetail) {
    return <></>;
  }

  const detailStartTimeLocal = convertStringToDate(
    firstDetail.startTimeLocal
  )?.toISOString();
  const detailEndTimeLocal = convertStringToDate(
    firstDetail.endTimeLocal
  )?.toISOString();
  if (!detailStartTimeLocal || !detailEndTimeLocal) {
    return <></>;
  }

  return (
    <>
      <Grid
        item
        xs={props.equalWidthDetails ? 6 : 2}
        className={classes.vacancyBlockItem}
      >
        {/* {`${format(detailStartTimeLocal, "h:mm a")} - ${format(
          detailEndTimeLocal,
          "h:mm a"
        )}`} */}

        <TimeInput
          label=""
          value={detailStartTimeLocal}
          onValidTime={time => {
            console.log(time);
          }}
          onChange={value => {
            console.log(value);
          }}
          earliestTime={detailStartTimeLocal}
        />
        <TimeInput
          label=""
          value={detailEndTimeLocal}
          onValidTime={time => {
            console.log(time);
          }}
          onChange={value => {
            console.log(value);
          }}
          earliestTime={detailEndTimeLocal}
        />
      </Grid>
      <Grid
        item
        xs={props.equalWidthDetails ? 6 : 10}
        className={classes.vacancyBlockItem}
      >
        <Select
          options={locationMenuOptions}
          onChange={val => console.log(val)}
          value={
            locationMenuOptions.find(
              op =>
                Number(op.value) ===
                (firstDetail.locationId || firstDetail.location?.id)
            ) || null
          }
        />
      </Grid>
    </>
  );
};
const useStyles = makeStyles(theme => ({
  vacancyBlockItem: {
    marginTop: theme.spacing(0.5),
  },
}));
