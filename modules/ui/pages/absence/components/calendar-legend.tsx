import { Grid } from "@material-ui/core";
import * as React from "react";
import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

export const CalendarLegend: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Grid
        xs={12}
        item
        container
        className={clsx(classes.legendBar, classes.padding)}
      >
        <Grid item xs={3}>
          <span className={classes.absence}></span>
          <span className={classes.text}>{t("Absence")}</span>
        </Grid>
        <Grid item xs={3}>
          <span className={classes.dayOff}></span>
          <span className={classes.text}>{t("Day off")}</span>
        </Grid>
        <Grid item xs={3}>
          <span className={classes.modifiedSchedule}></span>
          <span className={classes.text}>{t("Modified")}</span>
          <div className={classes.paddingLeft}>{t("schedule")}</div>
        </Grid>
        <Grid item xs={3}>
          <span className={classes.teacherWorkDay}></span>
          <span className={classes.text}>{t("Teacher")}</span>
          <div className={classes.paddingLeft}>{t("work day")}</div>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  dayOff: {
    height: "15px",
    width: "15px",
    backgroundColor: theme.calendar.absence.closed,
    borderRadius: "50%",
    display: "inline-block",
  },
  modifiedSchedule: {
    height: "15px",
    width: "15px",
    backgroundColor: theme.calendar.absence.modified,
    borderRadius: "50%",
    display: "inline-block",
  },
  teacherWorkDay: {
    height: "15px",
    width: "15px",
    backgroundColor: theme.calendar.absence.inservice,
    borderRadius: "50%",
    display: "inline-block",
  },
  absence: {
    height: "15px",
    width: "15px",
    backgroundColor: theme.calendar.absence.existingAbsence,
    borderRadius: "50%",
    display: "inline-block",
  },
  text: {
    fontWight: 500,
    paddingLeft: theme.spacing(2),
  },
  legendBar: {
    paddingTop: theme.spacing(3),
    height: "40px",
  },
  padding: {
    padding: theme.spacing(1),
    paddingTop: "15px",
  },
  paddingLeft: {
    paddingLeft: theme.spacing(4),
  },
}));
