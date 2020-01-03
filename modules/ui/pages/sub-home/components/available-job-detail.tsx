import { Grid, Typography } from "@material-ui/core";
import * as React from "react";
import { useStyles } from "./available-job";
import { formatIsoDateIfPossible } from "helpers/date";
import { DayIcon } from "ui/components/day-icon";
import { useTranslation } from "react-i18next";
import { parseDayPortion } from "ui/components/helpers";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  shadeRow: boolean;
};

export const AvailableJobDetail: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const dayPortionLabel = parseDayPortion(t, props.dayPortion);
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
        <Grid item xs={3}>
          <div className={classes.dayPartContainer}>
            <DayIcon
              dayPortion={props.dayPortion}
              startTime={props.startTimeLocal}
            />
            <div className={classes.dayPart}>
              <Typography className={classes.lightText}>
                {`${formatIsoDateIfPossible(
                  props.startTimeLocal,
                  "h:mm aaa"
                )} - ${formatIsoDateIfPossible(
                  props.endTimeLocal,
                  "h:mm aaa"
                )} ${dayPortionLabel}`}
              </Typography>
            </div>
          </div>
        </Grid>
      </Grid>
    </>
  );
};
