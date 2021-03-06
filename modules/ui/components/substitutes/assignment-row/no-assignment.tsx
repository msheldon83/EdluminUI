import * as React from "react";
import { DayPart } from "graphql/server-types.gen";
import { makeStyles } from "@material-ui/styles";
import { Grid, Button, Typography } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import * as DateFns from "date-fns";

type Props = {
  date: Date;
  className?: string;
};

export const NoAssignment: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const vacancyDates = DateFns.format(props.date, "MMM d");
  const vacancyDaysOfWeek = DateFns.format(props.date, "EEEE");

  return (
    <Grid
      container
      className={[classes.container, props.className].join(" ")}
      alignContent="center"
    >
      <Grid item xs={2}>
        <Typography className={classes.date}>{vacancyDates}</Typography>
        <Typography className={classes.subText}>{vacancyDaysOfWeek}</Typography>
      </Grid>

      <Grid item>
        <Typography className={classes.text}>{t("No assignment")}</Typography>
      </Grid>
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: { padding: theme.spacing(2) },
  date: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: 500,
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  text: {
    fontSize: theme.typography.pxToRem(18),
  },
}));
