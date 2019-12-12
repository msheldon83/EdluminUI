import * as React from "react";
import { useTranslation } from "react-i18next";
import { EmployeeAbsenceDetail } from "../types";
import { Grid, makeStyles, Typography, Button, Chip } from "@material-ui/core";
import { isEqual, format } from "date-fns";
import { DayIcon } from "ui/components/day-icon";
import { parseDayPortion } from "ui/components/helpers";
import { Link } from "react-router-dom";
import { EmployeeEditAbsenceRoute } from "ui/routes/edit-absence";

type Props = {
  absence: EmployeeAbsenceDetail;
  cancelAbsence: (absenceId: string) => Promise<void>;
  showAbsenceChip?: boolean;
};

export const AbsenceDetailRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const dateRangeDisplay = isEqual(
    props.absence.startDate,
    props.absence.endDate
  )
    ? format(props.absence.startDate, "MMM d")
    : `${format(props.absence.startDate, "MMM d")} - ${format(
        props.absence.endDate,
        "MMM d"
      )}`;

  const dayPortionNumberDisplay = Math.round(props.absence.totalDayPortion);
  const dayPortionDisplay =
    dayPortionNumberDisplay >= 1
      ? `${dayPortionNumberDisplay} ${parseDayPortion(
          t,
          props.absence.totalDayPortion
        )}`
      : parseDayPortion(t, props.absence.totalDayPortion);

  return (
    <>
      <Grid item xs={3}>
        <div className={classes.detailText}>{props.absence.absenceReason}</div>
        <div className={classes.subText}>{dateRangeDisplay}</div>
        {props.showAbsenceChip && <Chip label={t("Absence")} />}
      </Grid>
      <Grid item xs={3}>
        {props.absence.substitute && (
          <>
            <div className={classes.detailText}>
              {props.absence.substitute?.name}
            </div>
            <div className={classes.subText}>
              {props.absence.substitute?.phoneNumber}
            </div>
          </>
        )}
        {!props.absence.substitute && props.absence.subRequired && (
          <div className={classes.subText}>{t("No substitute assigned")}</div>
        )}
        {!props.absence.substitute && !props.absence.subRequired && (
          <div className={classes.subText}>{t("No substitute required")}</div>
        )}
      </Grid>
      <Grid item xs={3}>
        <div className={classes.dayPartContainer}>
          <DayIcon
            dayPortion={props.absence.totalDayPortion}
            startTime={props.absence.startTimeLocal.toString()}
          />
          <div className={classes.dayPart}>
            <div className={classes.detailText}>{dayPortionDisplay}</div>
            <div className={classes.subText}>
              {`${props.absence.startTime} - ${props.absence.endTime}`}
            </div>
          </div>
        </div>
      </Grid>
      <Grid item xs={1}>
        <div className={classes.detailText}>
          <Link
            to={EmployeeEditAbsenceRoute.generate({
              absenceId: props.absence.id,
            })}
          >
            {`#${props.absence.id}`}
          </Link>
        </div>
      </Grid>
      <Grid item xs={2} className={classes.cancelButtonContainer}>
        <Button
          variant="outlined"
          onClick={async () => await props.cancelAbsence(props.absence.id)}
          className={classes.cancelButton}
        >
          {t("Cancel")}
        </Button>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  detailText: {
    fontWeight: "bold",
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  dayPartContainer: {
    display: "flex",
  },
  dayPart: {
    paddingLeft: theme.spacing(),
  },
  cancelButtonContainer: {
    textAlign: "right",
  },
  cancelButton: {
    color: theme.palette.error.main,
  },
}));
