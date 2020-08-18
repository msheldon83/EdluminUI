import { Grid } from "@material-ui/core";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/styles";

export const CalendarLegend: React.FC<{}> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  return (
    <>
      <Grid xs={12} item container className={classes.legendBar}>
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
}));
