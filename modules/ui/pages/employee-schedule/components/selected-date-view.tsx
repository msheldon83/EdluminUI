import * as React from "react";
import { useTranslation } from "react-i18next";
import { Grid, makeStyles, Typography } from "@material-ui/core";
import {
  ScheduleDate,
  PositionScheduleDate,
  EmployeeAbsenceDetail,
} from "ui/components/employee/types";
import { format } from "date-fns";
import { useMemo } from "react";
import { AbsenceDetailRow } from "ui/components/employee/components/absence-detail-row";

type Props = {
  selectedDate: Date;
  scheduleDates: ScheduleDate[];
  cancelAbsence: (absenceId: string) => Promise<void>;
};

export const SelectedDateView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const allInstructionalDays = useMemo(
    () => props.scheduleDates.filter(s => s.type === "instructionalDay"),
    [props.scheduleDates]
  );
  const absenceDays = useMemo(
    () => props.scheduleDates.filter(s => s.type === "absence"),
    [props.scheduleDates]
  );
  const nonInstructionalOrAbsenceDays = useMemo(
    () =>
      props.scheduleDates.filter(
        s => s.type !== "instructionalDay" && s.type !== "absence"
      ),
    [props.scheduleDates]
  );

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Typography variant="h6">
          {format(props.selectedDate, "EEEE, MMMM d")}
        </Typography>
      </Grid>
      {displayAbsenceDayInformation(absenceDays, props.cancelAbsence)}
      {displayInstructionalDayInformation(allInstructionalDays, classes)}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(),
  },
  instructionalDay: {
    padding: theme.spacing(),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
}));

const displayInstructionalDayInformation = (
  instructionalDays: ScheduleDate[],
  classes: any
) => {
  return instructionalDays.map((d, i) => {
    const day = d.rawData as PositionScheduleDate;
    return (
      <Grid item container xs={12} key={i} className={classes.instructionalDay}>
        <Grid item xs={4}>
          <div>{day.position}</div>
          <div className={classes.subText}>{day.location}</div>
        </Grid>
        <Grid item>{`${day.startTime} - ${day.endTime}`}</Grid>
      </Grid>
    );
  });
};

const displayAbsenceDayInformation = (
  absenceDays: ScheduleDate[],
  cancelAbsence: (absenceId: string) => Promise<void>
) => {
  return absenceDays.map((a, i) => {
    const day = a.rawData as EmployeeAbsenceDetail;
    return (
      <Grid item container xs={12} spacing={4} key={i}>
        <AbsenceDetailRow absence={day} cancelAbsence={cancelAbsence} />
      </Grid>
    );
  });
};
