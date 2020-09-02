import { Chip, Grid, makeStyles, Typography } from "@material-ui/core";
import { format, isSameDay } from "date-fns";
import { TFunction } from "i18next";
import * as React from "react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetailRow } from "ui/components/employee/components/absence-detail-row";
import {
  AbsenceScheduleDate,
  InstructionalScheduleDate,
  OtherScheduleDate,
  ScheduleDate,
  EmployeeAbsenceDetail,
  CalendarScheduleDate,
  PositionScheduleDate,
  ContractDate,
} from "ui/components/employee/types";
import { compact } from "lodash-es";
import { CalendarDayType } from "graphql/server-types.gen";

type Props = {
  selectedDate: Date;
  scheduleDates: CalendarScheduleDate[];
  cancelAbsence?: (absenceId: string) => Promise<void>;
  hideAbsence?: (absenceId: string) => Promise<void>;
  actingAsEmployee?: boolean;
  orgId?: string;
};

export const SelectedDateView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const {
    absenceDays,
    instructionalDays,
    contractInstructionalDays,
    nonInstructionalDays,
  } = useMemo(() => {
    const absenceDays: EmployeeAbsenceDetail[] = [];
    const instructionalDays: PositionScheduleDate[] = [];
    const contractInstructionalDays: ContractDate[] = [];
    const nonInstructionalDays: ContractDate[] = [];

    props.scheduleDates.forEach(s => {
      absenceDays.push(...s.absences);
      instructionalDays.push(...s.modifiedDays);
      instructionalDays.push(...s.normalDays);
      contractInstructionalDays.push(...s.contractInstructionalDays);
      nonInstructionalDays.push(
        ...s.closedDays.concat(s.inServiceDays).concat(s.nonWorkDays)
      );
    });

    return {
      absenceDays,
      instructionalDays,
      contractInstructionalDays,
      nonInstructionalDays,
    };
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
        props.hideAbsence,
        props.actingAsEmployee,
        props.orgId
      )}
      {nonInstructionalDays.length === 0 &&
        displayInstructionalDayInformation(
          instructionalDays,
          contractInstructionalDays,
          classes,
          t
        )}
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
    backgroundColor: "#F5F5F5",
  },
}));

const displayInstructionalDayInformation = (
  instructionalDays: PositionScheduleDate[],
  contractInstructionalDays: ContractDate[],
  classes: any,
  t: TFunction
) => {
  return contractInstructionalDays
    .map((d, i) => {
      const description =
        d.hasCalendarChange &&
        (d.calendarChangeDescription || d.calendarChangeReasonName)
          ? compact([
              d.calendarChangeDescription,
              d.calendarChangeReasonName,
            ]).join(" - ")
          : t("Contracted Instructional Day");
      const showDates =
        d.startDate && d.endDate && !isSameDay(d.startDate, d.endDate);

      return (
        <Grid item container xs={12} key={i + 100} className={classes.detail}>
          <Grid item>
            <div>{description}</div>
            {showDates && (
              <div className={classes.subText}>{`${format(
                d.startDate!,
                "MMM d"
              )} - ${format(d.endDate!, "MMM d")}`}</div>
            )}
          </Grid>
        </Grid>
      );
    })
    .concat(
      instructionalDays
        .filter(d => d.startTime != d.endTime)
        .map((d, i) => {
          return (
            <Grid
              item
              container
              xs={12}
              key={i}
              className={classes.detail}
              spacing={2}
            >
              <Grid item xs={4}>
                <div>{d.position}</div>
                <div className={classes.subText}>{d.location}</div>
              </Grid>
              <Grid item>{`${d.startTime} - ${d.endTime}`}</Grid>
              {d.nonStandardVariantTypeName && (
                <Grid item>
                  <Chip label={d.nonStandardVariantTypeName} />
                </Grid>
              )}
            </Grid>
          );
        })
    );
};

const displayAbsenceDayInformation = (
  absenceDays: EmployeeAbsenceDetail[],
  cancelAbsence?: (absenceId: string) => Promise<void>,
  hideAbsence?: (absenceId: string) => Promise<void>,
  actingAsEmployee?: boolean,
  orgId?: string
) => {
  return absenceDays.map((a, i) => {
    const cancel = async () => cancelAbsence && (await cancelAbsence(a.id));
    return (
      <Grid item container xs={12} spacing={4} key={a.id}>
        <AbsenceDetailRow
          absence={a}
          cancelAbsence={cancel}
          hideAbsence={hideAbsence}
          showAbsenceChip={true}
          actingAsEmployee={actingAsEmployee}
          orgId={orgId}
        />
      </Grid>
    );
  });
};

const displayNonInstructionalDayInformation = (
  nonInstructionalDays: ContractDate[],
  classes: any,
  t: TFunction
) => {
  return nonInstructionalDays.map((d, i) => {
    const description =
      d.hasCalendarChange &&
      (d.calendarChangeDescription || d.calendarChangeReasonName)
        ? compact([
            d.calendarChangeDescription,
            d.calendarChangeReasonName,
          ]).join(" - ")
        : d.calendarDayType === CalendarDayType.TeacherWorkDay
        ? t("Teacher Inservice")
        : t("Non Work Day");
    const showDates =
      d.startDate && d.endDate && !isSameDay(d.startDate, d.endDate);

    return (
      <Grid item container xs={12} key={i} className={classes.detail}>
        <Grid item xs={2}>
          <div>{description}</div>
          {showDates && (
            <div className={classes.subText}>{`${format(
              d.startDate!,
              "MMM d"
            )} - ${format(d.endDate!, "MMM d")}`}</div>
          )}
        </Grid>
        <Grid item>
          <Chip
            label={
              d.calendarDayType === CalendarDayType.CancelledDay
                ? t("Closed")
                : t("Non-instructional")
            }
            className={
              d.calendarDayType === CalendarDayType.CancelledDay
                ? classes.closedChip
                : classes.nonInstructionalChip
            }
          />
        </Grid>
      </Grid>
    );
  });
};
