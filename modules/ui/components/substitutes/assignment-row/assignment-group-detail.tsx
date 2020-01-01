import { Grid, Typography, makeStyles, Button } from "@material-ui/core";
import * as React from "react";
import { formatIsoDateIfPossible } from "helpers/date";
import { useTranslation } from "react-i18next";
import { parseDayPortion } from "ui/components/helpers";
import { DayIcon } from "ui/components/day-icon";

type Props = {
  locationName: string;
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  shadeRow: boolean;
  onCancel?: () => void;
  className?: string;
  isAdmin: boolean;
  forSpecificAssignment?: boolean;
};

export const AssignmentGroupDetail: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const dayPortionLabel = parseDayPortion(t, props.dayPortion);
  return (
    <div
      className={[
        classes.container,
        props.shadeRow ? classes.shadedRow : classes.unshadedRow,
        props.className,
      ].join(" ")}
    >
      <div className={classes.date}>
        <Typography className={classes.text}>
          {formatIsoDateIfPossible(props.startTimeLocal, "EEE, MMM d")}
        </Typography>
      </div>

      <div className={classes.location}>
        <Typography className={classes.text}>{props.locationName}</Typography>
      </div>

      <div className={classes.dayPortion}>
        <DayIcon
          dayPortion={props.dayPortion}
          startTime={props.startTimeLocal}
          className={classes.smallDayIcon}
        />

        <Typography display="inline" className={classes.text}>
          {`${formatIsoDateIfPossible(
            props.startTimeLocal,
            "h:mm aaa"
          )} - ${formatIsoDateIfPossible(
            props.endTimeLocal,
            "h:mm aaa"
          )} ${dayPortionLabel}`}
        </Typography>
      </div>

      {!props.isAdmin ||
        (!props.forSpecificAssignment && (
          <Button className={classes.cancel} onClick={props.onCancel}>
            {t("Cancel")}
          </Button>
        ))}
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    justifyContent: "space-between",
    marginLeft: theme.spacing(1),
    marginRight: theme.spacing(1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    borderRadius: theme.typography.pxToRem(4),
  },
  text: {
    color: theme.customColors.edluminSubText,
    fontSize: theme.typography.fontSize,
  },
  shadedRow: {
    background: theme.customColors.lighterGray,
  },
  unshadedRow: {
    background: theme.customColors.white,
  },
  dayPortion: {
    display: "flex",
    alignItems: "center",
    flex: 6.5,
  },
  smallDayIcon: {
    width: theme.typography.pxToRem(16),
    margin: theme.spacing(1),
  },
  date: {
    flex: 2,
  },
  location: {
    flex: 9,
  },
  cancel: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.darkRed,
    textDecoration: "underline",
    fontWeight: 400,
  },
}));
