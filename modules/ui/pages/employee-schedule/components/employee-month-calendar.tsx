import { makeStyles } from "@material-ui/core";
import { parseISO, isSameMonth, isSameDay, isEqual, isToday } from "date-fns";
import * as React from "react";
import { useMemo } from "react";
import { SingleMonthCalendar } from "ui/components/form/single-month-calendar";
import { ScheduleDate } from "ui/components/employee/types";
import clsx from "clsx";

type Props = {
  date: string;
  onSelectDate: (scheduleDates: ScheduleDate[]) => void;
  scheduleDates: ScheduleDate[];
  selectedScheduleDates: ScheduleDate[];
};

export const EmployeeMonthCalendar: React.FC<Props> = props => {
  const classes = useStyles();
  const parsedDate = useMemo(() => parseISO(props.date), [props.date]);

  const selectedDate = useMemo(() => props.selectedScheduleDates[0]?.date, [
    props.selectedScheduleDates,
  ]);
  const checkDays = useMemo(
    () => selectedDate && isSameMonth(parsedDate, selectedDate),
    [parsedDate, selectedDate]
  );

  const customDates = useMemo(
    () => {
      const getTypeOfDayClass = (type: ScheduleDate["type"], date: Date) => {
        if (selectedDate && isSameDay(date, selectedDate)) {
          return classes.selected;
        }

        switch (type) {
          case "absence":
            return classes.absenceDay;
          case "nonWorkDay":
            return classes.nonWorkDay;
          case "cancelledDay":
            return classes.cancelledDay;
          case "teacherWorkDay":
            return classes.inserviceDay;
          case "pendingAbsence":
            return classes.pendingAbsence;
          case "deniedAbsence":
            return classes.deniedAbsence;
          case "instructionalDay":
          default:
            return classes.instructionalDay;
        }
      };

      return props.scheduleDates.map(d => ({
        date: d.date,
        buttonProps: {
          className: clsx(
            getTypeOfDayClass(d.type, d.date),
            classes.dayHover,
            isToday(d.date) ? classes.today : undefined
          ),
        },
      }));
    },
    /* eslint-disable-line react-hooks/exhaustive-deps */ [
      props.scheduleDates,
      selectedDate,
    ]
  );

  // If the selected day is not in assignmentDates, add an entry for it
  checkDays &&
    selectedDate &&
    customDates.push({
      date: selectedDate,
      buttonProps: { className: classes.selected },
    });

  return (
    <div className={classes.calendar}>
      <SingleMonthCalendar
        currentMonth={parsedDate}
        customDates={customDates}
        onSelectDate={(date: Date) => {
          const matchedScheduleDate = props.scheduleDates.filter(s =>
            isEqual(s.date, date)
          );
          if (matchedScheduleDate) {
            props.onSelectDate(matchedScheduleDate);
          }
        }}
        className={classes.calendarSize}
      />
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  calendar: {
    display: "flex",
  },
  calendarSize: {
    minWidth: theme.typography.pxToRem(300),
  },
  selected: {
    backgroundColor: theme.customColors.blueHover,
    color: theme.customColors.white,
    "&:hover": {
      backgroundColor: `${theme.customColors.blueHover} !important`,
    },
  },
  dayHover: {
    "&:hover": {
      backgroundColor: theme.customColors.sky,
      color: theme.customColors.white,
    },
  },
  instructionalDay: {},
  absenceDay: {
    backgroundColor: "#373361",
    color: theme.customColors.white,
  },
  nonWorkDay: {
    backgroundColor: theme.customColors.lightGray,
    color: theme.customColors.edluminSubText,
  },
  cancelledDay: {
    backgroundColor: "#FCE7E7",
    color: theme.customColors.darkRed,
  },
  //DELAY / DISMISSAL???
  inserviceDay: {
    backgroundColor: "#FFF5E5",
  },
  pendingAbsence: {
    backgroundColor: theme.customColors.yellow4,
    color: theme.customColors.black,
  },
  deniedAbsence: {
    backgroundColor: theme.customColors.darkRed,
    color: theme.customColors.white,
  },
  today: {
    border: "2px solid black",
  },
}));
