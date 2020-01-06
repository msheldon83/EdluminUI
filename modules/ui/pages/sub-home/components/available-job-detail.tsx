import { Grid, Typography, makeStyles } from "@material-ui/core";
import * as React from "react";
import { formatIsoDateIfPossible } from "helpers/date";
import { DayIcon } from "ui/components/day-icon";
import { useTranslation } from "react-i18next";
import { parseDayPortion } from "ui/components/helpers";
import { useIsMobile } from "hooks";

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
  const isMobile = useIsMobile();

  const dayPortionLabel = parseDayPortion(t, props.dayPortion);

  const renderdayPart = () => {
    return (
      <div className={classes.dayPartContainer}>
        <DayIcon
          dayPortion={props.dayPortion}
          startTime={props.startTimeLocal}
          className={classes.smallDayIcon}
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
    );
  };

  return (
    <>
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
          {renderdayPart()}
        </Grid>
        {isMobile && (
          <Grid item xs={12} className={classes.gridPadding}>
            <Typography className={classes.lightText}>
              {props.locationName}
            </Typography>
          </Grid>
        )}
      </Grid>
    </>
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
  dayPartContainer: {
    display: "flex",
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
  smallDayIcon: {
    width: theme.typography.pxToRem(16),
  },
  gridPadding: {
    padding: 0,
  },
}));
