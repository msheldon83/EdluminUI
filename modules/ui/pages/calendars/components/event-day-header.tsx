import { Grid } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { useTranslation } from "react-i18next";
import * as React from "react";
import clsx from "clsx";
import { parseISO, format, isBefore, getDay } from "date-fns";

type Props = {
  selectedDate: Date;
  eventCount: number;
};

export const DayHeader: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const dayOfWeek = format(props.selectedDate, "EEEE");
  const date = format(props.selectedDate, "LLL d");

  return (
    <>
      <Grid item xs={12}>
        <Grid item xs={3} className={classes.displayInline}>
          <div className={classes.dateBox}>
            <div className={classes.dayOfWeek}>{dayOfWeek}</div>
            <div className={classes.dateText}>{date}</div>
          </div>
        </Grid>
        {props.eventCount === 0 && (
          <Grid
            item
            xs={3}
            className={clsx(classes.displayInline, classes.paddingLeft)}
          >
            <div className={classes.dateText}>{t("No events on this day")}</div>
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  dayOfWeek: {
    color: theme.customColors.edluminSubText,
  },
  dateText: {
    fontSize: "1.125rem",
    fontWeight: 500,
  },
  dateBox: {
    paddingLeft: "15px",
    paddingTop: "10px",
  },
  paddingLeft: {
    paddingLeft: "65px",
  },
  displayInline: {
    display: "inline-block",
  },
}));
