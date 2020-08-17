import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { useMemo } from "react";
import { isToday, addDays } from "date-fns";
import { ApprovalStatus } from "graphql/server-types.gen";
import { useEmployeeScheduleDates } from "helpers/absence/use-employee-schedule-dates";
import { makeFlagClassKey } from "ui/components/employee/helpers";
import clsx from "clsx";

type Props = {
  employeeId: string;
  startDate: Date;
};

export const ScheduleCalendar: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { employeeId, startDate } = props;

  const employeeScheduleDates = useEmployeeScheduleDates(
    employeeId,
    startDate,
    startDate,
    addDays(startDate, 45)
  );

  // const pendingAbsenceDays = useMemo(() => {
  //   const days: Date[] = [];
  //   props.absences
  //     .filter(
  //       x =>
  //         x.approvalStatus === ApprovalStatus.ApprovalRequired ||
  //         x.approvalStatus === ApprovalStatus.PartiallyApproved
  //     )
  //     .forEach(a => {
  //       days.push(
  //         ...eachDayOfInterval({
  //           start: a.startDate,
  //           end: a.endDate,
  //         })
  //       );
  //     });
  //   return days;
  // }, [props.absences]);

  // const deniedAbsenceDays = useMemo(() => {
  //   const days: Date[] = [];
  //   props.absences
  //     .filter(x => x.approvalStatus === ApprovalStatus.Denied)
  //     .forEach(a => {
  //       days.push(
  //         ...eachDayOfInterval({
  //           start: a.startDate,
  //           end: a.endDate,
  //         })
  //       );
  //     });
  //   return days;
  // }, [props.absences]);

  // const absenceDays = useMemo(() => {
  //   const days: Date[] = [];
  //   props.absences
  //     .filter(
  //       x =>
  //         x.approvalStatus !== ApprovalStatus.ApprovalRequired &&
  //         x.approvalStatus !== ApprovalStatus.PartiallyApproved &&
  //         x.approvalStatus !== ApprovalStatus.Denied
  //     )
  //     .forEach(a => {
  //       days.push(
  //         ...eachDayOfInterval({
  //           start: a.startDate,
  //           end: a.endDate,
  //         })
  //       );
  //     });
  //   return days;
  // }, [props.absences]);

  // const disabledDates = props.disabledDates.map(date => ({
  //   date,
  //   buttonProps: { className: `${classes.dateDisabled} dateDisabled` },
  // }));

  // const absenceDates = useMemo(() => {
  //   let dates = [] as { date: Date; buttonProps: { className: string } }[];

  //   dates = dates.concat(
  //     absenceDays.map(date => ({
  //       date,
  //       buttonProps: { className: classes.absenceDate },
  //     }))
  //   );

  //   dates = dates.concat(
  //     pendingAbsenceDays.map(date => ({
  //       date,
  //       buttonProps: { className: classes.pendingDate },
  //     }))
  //   );

  //   dates = dates.concat(
  //     deniedAbsenceDays.map(date => ({
  //       date,
  //       buttonProps: { className: classes.deniedDate },
  //     }))
  //   );

  //   return dates;
  // }, [
  //   absenceDays,
  //   classes.absenceDate,
  //   classes.deniedDate,
  //   classes.pendingDate,
  //   deniedAbsenceDays,
  //   pendingAbsenceDays,
  // ]);

  // const customDates = disabledDates.concat(absenceDates);
  // const todayIndex = customDates.findIndex(o => isToday(o.date));
  // if (todayIndex === -1) {
  //   customDates.push({
  //     date: new Date(),
  //     buttonProps: { className: classes.today },
  //   });
  // } else {
  //   const today = customDates[todayIndex];
  //   customDates[todayIndex] = {
  //     date: today.date,
  //     buttonProps: {
  //       className: `${classes.today} ${today.buttonProps.className}`,
  //     },
  //   };
  // }

  const styledDates = useMemo(
    () =>
      employeeScheduleDates.map((calendarDate): {
        date: Date;
        buttonProps: { className: string };
        timeClass?: string;
      } => {
        const className = clsx(
          classes[
            makeFlagClassKey(
              calendarDate.absences.length > 0,
              calendarDate.closedDays.length > 0,
              calendarDate.modifiedDays.length > 0 ||
                calendarDate.contractInstructionalDays.length > 0,
              calendarDate.inServiceDays.length > 0,
              calendarDate.nonWorkDays.length > 0
            ) as keyof typeof classes
          ],
          isToday(calendarDate.date) ? classes.today : undefined
        );
        return {
          date: calendarDate.date,
          buttonProps: {
            className,
          },
          timeClass:
            calendarDate.absences.length > 0
              ? calendarDate.absences.some(
                  a => a.approvalStatus === ApprovalStatus.Denied
                )
                ? classes.deniedAbsenceToken
                : calendarDate.absences.some(
                    a =>
                      a.approvalStatus === ApprovalStatus.ApprovalRequired ||
                      a.approvalStatus === ApprovalStatus.PartiallyApproved
                  )
                ? classes.pendingAbsenceToken
                : classes.absenceToken
              : undefined,
        };
      }),
    [classes, employeeScheduleDates]
  );

  return (
    <Section className={classes.container}>
      <SectionHeader title={t("Upcoming schedule")} />
      <CustomCalendar month={startDate} customDates={styledDates} />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: 0,
  },
  today: {
    border: "3px solid #4CC17C",
  },
  absenceToken: {
    background: `radial-gradient(${theme.calendar.absence.existingAbsence} 50%, transparent 50%)`,
    color: theme.customColors.white,
  },
  pendingAbsenceToken: {
    background: `radial-gradient(${theme.calendar.absence.pendingApproval} 50%, transparent 50%)`,
    color: theme.customColors.black,
  },
  deniedAbsenceToken: {
    background: `radial-gradient(${theme.calendar.absence.denied} 50%, transparent 50%)`,
    color: theme.customColors.white,
  },
  nonWorkDay: {
    backgroundColor: theme.calendar.disabled,
    color: theme.customColors.black,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.disabled,
      color: theme.customColors.black,
    },
  },
  absence: {
    backgroundColor: theme.calendar.selected,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.selected,
      color: theme.customColors.white,
    },
  },
  closed: {
    backgroundColor: theme.calendar.closed,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.closed,
      color: theme.customColors.white,
    },
  },
  modified: {
    backgroundColor: theme.calendar.modified,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.modified,
      color: theme.customColors.white,
    },
  },
  inService: {
    backgroundColor: theme.calendar.inservice,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      backgroundColor: theme.calendar.inservice,
      color: theme.customColors.white,
    },
  },
  closedAndModified: {
    background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.modified} 50%)`,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.modified} 50%)`,
      color: theme.customColors.white,
    },
  },
  closedAndInService: {
    background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.inservice} 50%)`,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.closed} 50%, ${theme.calendar.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
  modifiedAndInService: {
    background: `linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      background: `linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
  closedAndModifiedAndInService: {
    background: `radial-gradient(${theme.calendar.closed} 50%, transparent 50%),
                 linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
    color: theme.customColors.white,
    pointerEvents: "none",

    "&:hover": {
      background: `radial-gradient(${theme.calendar.closed} 50%, transparent 50%),
                  linear-gradient(to bottom right, ${theme.calendar.modified} 50%, ${theme.calendar.inservice} 50%)`,
      color: theme.customColors.white,
    },
  },
}));
