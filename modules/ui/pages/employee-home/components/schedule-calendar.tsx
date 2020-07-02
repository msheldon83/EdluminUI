import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Checkbox, Link } from "@material-ui/core";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { CustomCalendar } from "ui/components/form/custom-calendar";
import { useMemo } from "react";
import { eachDayOfInterval, isToday } from "date-fns";
import { EmployeeAbsenceDetail } from "ui/components/employee/types";
import { ApprovalStatus } from "graphql/server-types.gen";

type Props = {
  startDate: Date;
  absences: EmployeeAbsenceDetail[];
  disabledDates: Date[];
};

export const ScheduleCalendar: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const pendingAbsenceDays = useMemo(() => {
    const days: Date[] = [];
    props.absences
      .filter(
        x =>
          x.approvalStatus === ApprovalStatus.ApprovalRequired ||
          x.approvalStatus === ApprovalStatus.PartiallyApproved
      )
      .forEach(a => {
        days.push(
          ...eachDayOfInterval({
            start: a.startDate,
            end: a.endDate,
          })
        );
      });
    return days;
  }, [props.absences]);

  const deniedAbsenceDays = useMemo(() => {
    const days: Date[] = [];
    props.absences
      .filter(x => x.approvalStatus === ApprovalStatus.Denied)
      .forEach(a => {
        days.push(
          ...eachDayOfInterval({
            start: a.startDate,
            end: a.endDate,
          })
        );
      });
    return days;
  }, [props.absences]);

  const absenceDays = useMemo(() => {
    const days: Date[] = [];
    props.absences
      .filter(
        x =>
          x.approvalStatus !== ApprovalStatus.ApprovalRequired &&
          x.approvalStatus !== ApprovalStatus.PartiallyApproved &&
          x.approvalStatus !== ApprovalStatus.Denied
      )
      .forEach(a => {
        days.push(
          ...eachDayOfInterval({
            start: a.startDate,
            end: a.endDate,
          })
        );
      });
    return days;
  }, [props.absences]);

  const disabledDates = props.disabledDates.map(date => ({
    date,
    buttonProps: { className: `${classes.dateDisabled} dateDisabled` },
  }));

  const absenceDates = useMemo(() => {
    let dates = [] as { date: Date; buttonProps: { className: string } }[];

    dates = dates.concat(
      absenceDays.map(date => ({
        date,
        buttonProps: { className: classes.absenceDate },
      }))
    );

    dates = dates.concat(
      pendingAbsenceDays.map(date => ({
        date,
        buttonProps: { className: classes.pendingDate },
      }))
    );

    dates = dates.concat(
      deniedAbsenceDays.map(date => ({
        date,
        buttonProps: { className: classes.deniedDate },
      }))
    );

    return dates;
  }, [
    absenceDays,
    classes.absenceDate,
    classes.deniedDate,
    classes.pendingDate,
    deniedAbsenceDays,
    pendingAbsenceDays,
  ]);

  const customDates = disabledDates.concat(absenceDates);
  const todayIndex = customDates.findIndex(o => isToday(o.date));
  if (todayIndex === -1) {
    customDates.push({
      date: new Date(),
      buttonProps: { className: classes.today },
    });
  } else {
    const today = customDates[todayIndex];
    customDates[todayIndex] = {
      date: today.date,
      buttonProps: {
        className: `${classes.today} ${today.buttonProps.className}`,
      },
    };
  }

  return (
    <Section className={classes.container}>
      <SectionHeader title={t("Upcoming schedule")} />
      <CustomCalendar month={props.startDate} customDates={customDates} />
    </Section>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    marginBottom: 0,
  },
  dateDisabled: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.palette.text.disabled,

    "&:hover": {
      backgroundColor: theme.customColors.lightGray,
      color: theme.palette.text.disabled,
    },
  },
  absenceDate: {
    backgroundColor: "#373361",
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: "#373361",
      color: theme.customColors.white,
    },
  },
  deniedDate: {
    backgroundColor: theme.customColors.darkRed,
    color: theme.customColors.white,

    "&:hover": {
      backgroundColor: theme.customColors.darkRed,
      color: theme.customColors.white,
    },
  },
  pendingDate: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.customColors.black,

    "&:hover": {
      backgroundColor: theme.customColors.yellow4,
      color: theme.customColors.black,
    },
  },
  today: {
    border: "solid black 1px",
    fontWeight: "bold",
  },
}));
