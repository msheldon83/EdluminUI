import { makeStyles, Typography } from "@material-ui/core";
import { formatIsoDateIfPossible } from "helpers/date";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DayIcon } from "ui/components/day-icon";
import { parseDayPortion } from "ui/components/helpers";

type Props = {
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  iconClassName?: string;
  className?: string;
};

export const DetailDayPartDisplay: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const dayPortionLabel = parseDayPortion(t, props.dayPortion);

  return (
    <div className={[classes.dayPartContainer, props.className].join(" ")}>
      <DayIcon
        dayPortion={props.dayPortion}
        startTime={props.startTimeLocal}
        className={[classes.smallDayIcon, props.iconClassName].join(" ")}
      />
      <Typography className={classes.lightText} display="inline">
        {`${formatIsoDateIfPossible(
          props.startTimeLocal,
          "h:mm aaa"
        )} - ${formatIsoDateIfPossible(
          props.endTimeLocal,
          "h:mm aaa"
        )} ${dayPortionLabel}`}
      </Typography>
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  lightText: {
    fontSize: theme.typography.pxToRem(14),
    color: theme.customColors.edluminSubText,
  },
  dayPartContainer: {
    display: "flex",
  },
  smallDayIcon: {
    width: theme.typography.pxToRem(16),
  },
}));
