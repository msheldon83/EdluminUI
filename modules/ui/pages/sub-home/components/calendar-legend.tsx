import { Grid } from "@material-ui/core";
import clsx from "clsx";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

type Props = {
  calendarView?: boolean;
};

export const CalendarLegend: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const { calendarView = false } = props;

  return (
    <>
      <Grid
        xs={12}
        item
        container
        className={clsx({
          [classes.legendBar]: true,
          [classes.padding]: calendarView,
        })}
      >
        <Grid item xs={3}>
          <span className={classes.assignment}></span>
          <span className={classes.text}>{t("Assignment")}</span>
        </Grid>
        <Grid item xs={4}>
          <span className={classes.notAvailable}></span>
          <span className={classes.text}>{t("Not available")}</span>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  notAvailable: {
    height: "15px",
    width: "15px",
    backgroundColor: "#e1e1e1",
    borderRadius: "50%",
    display: "inline-block",
  },
  assignment: {
    height: "15px",
    width: "15px",
    backgroundColor: "#373361",
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
}));
