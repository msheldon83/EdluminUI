import { makeStyles, Typography } from "@material-ui/core";
import { formatIsoDateIfPossible } from "helpers/date";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { DayIcon } from "ui/components/day-icon";

type Props = {
  startTimeLocal: string;
  endTimeLocal: string;
  dayPortion: number;
  payInfoLabel: string;
  iconClassName?: string;
  className?: string;
};

export const DetailDayPartDisplay: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

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
        )} - ${formatIsoDateIfPossible(props.endTimeLocal, "h:mm aaa")} ${
          props.payInfoLabel
        }`}
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
