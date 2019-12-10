import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { useStyles } from "./available-job";
import { formatIsoDateIfPossible } from "helpers/date";
import { DayIcon } from "../../../components/day-icon";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  dayPortionLabel: string;
  shadeRow: boolean;
};

export const AvailableJobDetail: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <>
      <Grid
        container
        item
        xs={12}
        justify={"flex-start"}
        spacing={2}
        className={props.shadeRow ? classes.shadedRow : undefined}
      >
        <Grid item xs={1}>
          <Typography className={classes.lightText}>
            {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography className={classes.lightText}>
            {props.locationName}
          </Typography>
        </Grid>
        <Grid item xs={3}></Grid>
        <Grid item xs={1}>
          <DayIcon
            dayPortion={props.dayPortion}
            startTime={props.startTimeLocal}
          />
        </Grid>
        <Grid item xs={2}>
          <Typography className={classes.lightText}>
            {`${formatIsoDateIfPossible(
              props.startTimeLocal,
              "h:mm aaa"
            )} - ${formatIsoDateIfPossible(props.endTimeLocal, "h:mm aaa")} ${
              props.dayPortionLabel
            }`}
          </Typography>
        </Grid>
      </Grid>
    </>
  );
};
