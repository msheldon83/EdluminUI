import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { useMemo } from "react";
import { isToday, addDays } from "date-fns";
import { useEmployeeScheduleDates } from "helpers/absence/use-employee-schedule-dates";
import { makeFlagClassKey } from "ui/components/employee/helpers";
import { CalendarLegend } from "./calendar-legend";
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
            calendarDate.absences.length > 0 ? classes.absenceToken : undefined,
        };
      }),
    [classes, employeeScheduleDates]
  );

  return (
    <Section className={classes.container}>
      <SectionHeader title={t("Upcoming schedule")} />
      <CustomCalendar month={startDate} customDates={styledDates} />
      <CalendarLegend />
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
    background: `radial-gradient(${theme.calendar.selected} 50%, transparent 50%)`,
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
