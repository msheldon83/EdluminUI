import { Grid, makeStyles, Typography } from "@material-ui/core";
import { formatIsoDateIfPossible } from "helpers/date";
import { useIsMobile } from "hooks";
import * as React from "react";
import { DetailDayPartDisplay } from "ui/components/substitutes/detail-day-part-display";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  shadeRow: boolean;
};

export const AvailableJobDetail: React.FC<Props> = props => {
  const classes = useStyles();
  const isMobile = useIsMobile();

  return (
    <Grid
      container
      item
      xs={12}
      justify={"flex-start"}
      alignItems={"center"}
      className={props.shadeRow ? classes.shadedRow : classes.nonShadedRow}
    >
      <Grid item xs={isMobile ? 4 : 1} className={classes.gridPadding}>
        <Typography className={classes.lightText}>
          {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
        </Typography>
      </Grid>
      {!isMobile && (
        <>
          <Grid item xs={3} className={classes.gridPadding}>
            <Typography className={classes.lightText}>
              {props.locationName}
            </Typography>
          </Grid>
          <Grid item xs={2}></Grid>
        </>
      )}
      <Grid item xs={isMobile ? 8 : 3} className={classes.gridPadding}>
        <DetailDayPartDisplay
          dayPortion={props.dayPortion}
          endTimeLocal={props.endTimeLocal}
          startTimeLocal={props.startTimeLocal}
          iconClassName={classes.dayPartIcon}
        />
      </Grid>
      {isMobile && (
        <Grid item xs={12} className={classes.gridPadding}>
          <Typography className={classes.lightText}>
            {props.locationName}
          </Typography>
        </Grid>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  lightText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
  },
  nonShadedRow: {
    padding: theme.spacing(1),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    padding: theme.spacing(1),
  },
  gridPadding: {
    padding: 0,
  },
  dayPartIcon: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
}));
