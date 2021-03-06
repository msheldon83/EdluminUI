import { makeStyles, Typography } from "@material-ui/core";
import { formatIsoDateIfPossible } from "helpers/date";
import * as React from "react";
import { DetailDayPartDisplay } from "ui/components/substitutes/detail-day-part-display";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  payInfoLabel: string;
  shadeRow: boolean;
  viewingAsAdmin?: boolean;
};

export const AvailableJobDetailUI: React.FC<Props> = props => {
  const { viewingAsAdmin } = props;

  const classes = useStyles({ viewingAsAdmin });

  return (
    <div
      className={[
        classes.container,
        props.shadeRow ? classes.shadedRow : classes.nonShadedRow,
      ].join(" ")}
    >
      <div className={classes.date}>
        <Typography className={classes.lightText}>
          {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
        </Typography>
      </div>
      <div className={classes.location}>
        <Typography className={classes.lightText}>
          {props.locationName}
        </Typography>
      </div>

      <DetailDayPartDisplay
        dayPortion={props.dayPortion}
        payInfoLabel={props.payInfoLabel}
        endTimeLocal={props.endTimeLocal}
        startTimeLocal={props.startTimeLocal}
        iconClassName={classes.dayPartIcon}
        className={classes.dayPortion}
      />
    </div>
  );
};

export const MobileAvailableJobDetailUI: React.FC<Props> = props => {
  const mobileClasses = useMobileStyles();
  const classes = useStyles();

  return (
    <div
      className={[
        mobileClasses.container,
        props.shadeRow ? classes.shadedRow : classes.nonShadedRow,
      ].join(" ")}
    >
      <div className={mobileClasses.dateAndDayPartContainer}>
        <div className={mobileClasses.date}>
          <Typography className={classes.lightText}>
            {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
          </Typography>
        </div>
        <DetailDayPartDisplay
          dayPortion={props.dayPortion}
          payInfoLabel={props.payInfoLabel}
          endTimeLocal={props.endTimeLocal}
          startTimeLocal={props.startTimeLocal}
          iconClassName={classes.dayPartIcon}
          className={mobileClasses.dayPortion}
        />
      </div>

      <Typography className={classes.lightText}>
        {props.locationName}
      </Typography>
    </div>
  );
};

type StyleProps = {
  viewingAsAdmin?: boolean;
};

const useStyles = makeStyles(theme => ({
  lightText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
  },
  nonShadedRow: {
    background: theme.customColors.white,
    padding: theme.spacing(1),
  },
  shadedRow: {
    background: theme.customColors.lightGray,
    padding: theme.spacing(1),
  },

  dayPartIcon: {
    marginRight: theme.spacing(1),
    marginLeft: theme.spacing(1),
  },
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },

  date: (props: StyleProps) => ({
    flex: props.viewingAsAdmin ? 1.9 : 1.7,
  }),
  location: (props: StyleProps) => ({
    flex: props.viewingAsAdmin ? 8 : 7,
  }),
  dayPortion: (props: StyleProps) => ({
    display: "flex",
    alignItems: "center",
    flex: props.viewingAsAdmin ? 6.2 : 7,
  }),
}));

const useMobileStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
  },
  dateAndDayPartContainer: {
    display: "flex",
  },
  date: {
    flex: 2,
  },
  dayPortion: {
    display: "flex",
    alignItems: "center",
    flex: 5,
  },
}));
