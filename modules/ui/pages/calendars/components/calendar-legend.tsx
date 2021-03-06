import clsx from "clsx";
import { Grid } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

export const CalendarLegend: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <Grid xs={6} item container className={classes.legendBar}>
      <Grid item xs={4} className={classes.paddingLeft}>
        <span className={classes.dayOff}></span>
        <span className={classes.text}>{t("Day off")}</span>
      </Grid>
      <Grid item xs={4} className={classes.paddingLeft}>
        <span className={classes.modifiedSchedule}></span>
        <span className={classes.text}>{t("Modified schedule")}</span>
      </Grid>
      <Grid item xs={4} className={classes.paddingLeft}>
        <span className={classes.teacherWorkDay}></span>
        <span className={classes.text}>{t("Teacher work day")}</span>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  dayOff: {
    height: "15px",
    width: "15px",
    backgroundColor: "#FF5555",
    borderRadius: "50%",
    display: "inline-block",
  },
  modifiedSchedule: {
    height: "15px",
    width: "15px",
    backgroundColor: "#FFCC01",
    borderRadius: "50%",
    display: "inline-block",
  },
  teacherWorkDay: {
    height: "15px",
    width: "15px",
    backgroundColor: "#6471DF",
    borderRadius: "50%",
    display: "inline-block",
  },
  text: {
    fontWight: 500,
    paddingLeft: theme.spacing(2),
  },
  legendBar: {
    height: "50px",
    paddingTop: "20px",
  },
  paddingLeft: { paddingLeft: "27px" },
}));
