import { Chip, Grid, makeStyles, Typography } from "@material-ui/core";
import { format, isSameDay } from "date-fns";
import { TFunction } from "i18next";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetailRow } from "ui/components/employee/components/absence-detail-row";
import {
  ContractDate,
  EmployeeAbsenceDetail,
  PositionScheduleDate,
  AbsenceScheduleDate,
  InstructionalScheduleDate,
  OtherScheduleDate,
  ScheduleDate,
} from "ui/components/employee/types";

type Props = {
  selectedDate: Date;
  scheduleDates: ScheduleDate[];
  cancelAbsence?: (absenceId: string) => Promise<void>;
  actingAsEmployee?: boolean;
  orgId?: string;
};

export const SelectedDateView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    absenceDays,
    instructionalDays,
    nonInstructionalDays,
  } = useMemo(() => {
    const absenceDays: AbsenceScheduleDate[] = [];
    const instructionalDays: InstructionalScheduleDate[] = [];
    const nonInstructionalDays: OtherScheduleDate[] = [];

    props.scheduleDates.forEach(s => {
      switch (s.type) {
        case "pendingAbsence":
        case "deniedAbsence":
        case "absence":
          absenceDays.push(s);
          break;
        case "instructionalDay":
          instructionalDays.push(s);
          break;
        case "nonWorkDay":
        case "teacherWorkDay":
        case "cancelledDay":
          nonInstructionalDays.push(s);
      }
    });

    return { absenceDays, instructionalDays, nonInstructionalDays };
  }, [props.scheduleDates]);

  return (
    <Grid container className={classes.container}>
      <Grid item xs={12}>
        <Typography variant="h6">
          {format(props.selectedDate, "EEEE, MMMM d")}
        </Typography>
      </Grid>
      {displayAbsenceDayInformation(
        absenceDays,
        props.cancelAbsence,
        props.actingAsEmployee,
        props.orgId
      )}
      {displayInstructionalDayInformation(instructionalDays, classes)}
      {displayNonInstructionalDayInformation(nonInstructionalDays, classes, t)}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    padding: theme.spacing(),
  },
  detail: {
    padding: theme.spacing(),
  },
  subText: {
    color: theme.customColors.edluminSubText,
  },
  nonInstructionalChip: {
    backgroundColor: "#FFF5E5",
  },
  closedChip: {
    backgroundColor: "##F5F5F5",
  },
}));

const displayInstructionalDayInformation = (
  instructionalDays: InstructionalScheduleDate[],
  classes: any
) => {
  return instructionalDays
    .filter(d => d.rawData.startTime != d.rawData.endTime)
    .map((d, i) => {
      const day = d.rawData;
      return (
        <Grid item container xs={12} key={i} className={classes.detail}>
          <Grid item xs={4}>
            <div>{day.position}</div>
            <div className={classes.subText}>{day.location}</div>
          </Grid>
          <Grid item>{`${day.startTime} - ${day.endTime}`}</Grid>
          {day.nonStandardVariantTypeName && (
            <Grid item>
              <Chip label={day.nonStandardVariantTypeName} />
            </Grid>
          )}
        </Grid>
      );
    });
};

const displayAbsenceDayInformation = (
  absenceDays: AbsenceScheduleDate[],
  cancelAbsence?: (absenceId: string) => Promise<void>,
  actingAsEmployee?: boolean,
  orgId?: string
) => {
  return absenceDays.map((a, i) => {
    const day = a.rawData;
    const cancel = async () => cancelAbsence && (await cancelAbsence(day.id));
    return (
      <Grid item container xs={12} spacing={4} key={day.id}>
        <AbsenceDetailRow
          absence={day}
          cancelAbsence={cancel}
          showAbsenceChip={true}
          actingAsEmployee={actingAsEmployee}
          orgId={orgId}
        />
      </Grid>
    );
  });
};

const displayNonInstructionalDayInformation = (
  nonInstructionalDays: OtherScheduleDate[],
  classes: any,
  t: TFunction
) => {
  return nonInstructionalDays.map((d, i) => {
    const day = d.rawData;

    const description = d.description
      ? d.description
      : d.type === "teacherWorkDay"
      ? t("Teacher Inservice")
      : t("Non Work Day");
    const showDates =
      !!day.startDate &&
      !!day.endDate &&
      !isSameDay(day.startDate, day.endDate);

    return (
      <Grid item container xs={12} key={i} className={classes.detail}>
        <Grid item xs={2}>
          <div>{description}</div>
          {showDates && (
            <div className={classes.subText}>{`${format(
              day.startDate!,
              "MMM d"
            )} - ${format(day.endDate!, "MMM d")}`}</div>
          )}
        </Grid>
        <Grid item>
          <Chip
            label={
              d.type === "cancelledDay" ? t("Closed") : t("Non-instructional")
            }
            className={
              d.type === "cancelledDay"
                ? classes.closedChip
                : classes.nonInstructionalChip
            }
          />
        </Grid>
      </Grid>
    );
  });
};
