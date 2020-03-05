import * as React from "react";
import {
  Button,
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { format, parseISO } from "date-fns";
import { midnightTime, timeStampToIso } from "helpers/time";

type ScheduleDay = {
  date: Date;
  startTime: number;
  endTime: number;
  location: string;
};

type Props = {
  scheduleDays: ScheduleDay[];
};

export const VacancySubstituteDetailsSection: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const formatLabel = (d: number) => {
    return format(
      parseISO(timeStampToIso(midnightTime().setSeconds(d))),
      "h:mm a"
    );
  };

  return (
    <>
      <Grid container>
        <Grid item xs={12}>
          {" "}
          <Typography className={classes.title} variant="h6">
            {t("Substitute Details")}
          </Typography>
        </Grid>
        <Grid item xs={12} className={classes.vacancyDetailsHeader}>
          {t("Substitute schedule")}
        </Grid>
        {props.scheduleDays.map((sd, i) => {
          return (
            <Grid className={classes.scheduleItem} item container key={i}>
              <Grid xs={12} item>
                <Typography variant="h6">
                  {format(sd.date, "EEE, MMM d")}
                </Typography>
              </Grid>
              <Grid xs={6} item>
                <Typography>
                  {sd.startTime && sd.endTime
                    ? `${formatLabel(sd.startTime)} - ${formatLabel(
                        sd.endTime
                      )}`
                    : ""}
                </Typography>
              </Grid>
              <Grid xs={6} item>
                <Typography>{sd.location}</Typography>
              </Grid>
            </Grid>
          );
        })}
      </Grid>
    </>
  );
};
const useStyles = makeStyles(theme => ({
  title: {
    marginBottom: theme.typography.pxToRem(15),
  },
  scheduleItem: {
    marginTop: theme.typography.pxToRem(15),
    marginBottom: theme.typography.pxToRem(15),
  },
  fullWidth: {
    width: "100%",
  },
  vacancySummaryHeader: {
    marginBottom: theme.spacing(),
  },
  vacancyDetailsHeader: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.customColors.edluminSubText,
    borderBottom: `${theme.typography.pxToRem(1)} solid ${
      theme.customColors.medLightGray
    }`,
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    paddingRight: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  detailRow: {
    paddingBottom: theme.spacing(),
  },
}));
