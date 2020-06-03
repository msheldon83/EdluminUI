import { Grid, makeStyles, Typography } from "@material-ui/core";
import { isSameDay, isSameMonth, parseISO, isWithinInterval } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { GetEmployeePositionContractSchedule } from "ui/components/employee/graphql/get-employee-position-contract-schedule.gen";
import {
  GetContractDates,
  GetPositionScheduleDates,
  GroupEmployeeScheduleByMonth,
} from "ui/components/employee/helpers";
import {
  EmployeeAbsenceDetail,
  ScheduleDate,
} from "ui/components/employee/types";
import { EmployeeMonthCalendar } from "./employee-month-calendar";

type Props = {
  employeeId: string | undefined;
  startDate: Date;
  endDate: Date;
  absences: EmployeeAbsenceDetail[];
  selectedScheduleDates: ScheduleDate[];
  setSelectedScheduleDates: React.Dispatch<
    React.SetStateAction<ScheduleDate[]>
  >;
};

export const CalendarView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    selectedScheduleDates,
    setSelectedScheduleDates,
    startDate,
    endDate,
  } = props;
  const today = useMemo(() => new Date(), []);

  const onSelectDate = React.useCallback(
    (scheduleDates: ScheduleDate[]) => setSelectedScheduleDates(scheduleDates),
    [setSelectedScheduleDates]
  );

  const getEmployeeSchedule = useQueryBundle(
    GetEmployeePositionContractSchedule,
    {
      variables: {
        id: props.employeeId ?? "0",
        fromDate: startDate,
        toDate: endDate,
      },
      skip: !props.employeeId,
    }
  );
  const positionSchedule = useMemo(() => {
    return getEmployeeSchedule.state === "LOADING" ||
      getEmployeeSchedule.state === "UPDATING"
      ? []
      : (getEmployeeSchedule.data?.employee
          ?.employeePositionSchedule as GetEmployeePositionContractSchedule.EmployeePositionSchedule[]);
  }, [getEmployeeSchedule]);
  const contractSchedule = useMemo(() => {
    return getEmployeeSchedule.state === "LOADING" ||
      getEmployeeSchedule.state === "UPDATING"
      ? []
      : (getEmployeeSchedule.data?.employee
          ?.employeeContractSchedule as GetEmployeePositionContractSchedule.EmployeeContractSchedule[]);
  }, [getEmployeeSchedule]);

  const monthGroups = useMemo(
    () =>
      GroupEmployeeScheduleByMonth(
        startDate,
        endDate,
        props.absences,
        GetContractDates(contractSchedule),
        GetPositionScheduleDates(positionSchedule)
      ),
    [props.absences, startDate, endDate, positionSchedule, contractSchedule]
  );

  // Default to Today if it exists in the current set of Months
  useEffect(() => {
    if (
      getEmployeeSchedule.state === "DONE" &&
      monthGroups &&
      monthGroups.length > 0
    ) {
      const dateToSelect = isWithinInterval(today, {
        start: startDate,
        end: endDate,
      })
        ? today
        : startDate;

      if (
        selectedScheduleDates.filter(s =>
          isWithinInterval(s.date, {
            start: startDate,
            end: endDate,
          })
        ).length === 0
      ) {
        const month = monthGroups.find(m =>
          isSameMonth(parseISO(m.month), dateToSelect)
        );
        if (month) {
          setSelectedScheduleDates(
            month.scheduleDates.filter(s => isSameDay(s.date, dateToSelect))
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    getEmployeeSchedule.state,
    today,
    monthGroups,
    selectedScheduleDates.length,
    setSelectedScheduleDates,
    startDate,
    endDate,
  ]);

  if (getEmployeeSchedule.state !== "DONE") {
    return (
      <>
        <Grid container spacing={2}>
          <Grid item xs={12} className={classes.loading}>
            <Typography variant="h5">{t("Loading Calendar")} ...</Typography>
          </Grid>
        </Grid>
      </>
    );
  }

  return (
    <Grid container spacing={2}>
      {monthGroups.map((group, i) => (
        <Grid item xs={4} key={i}>
          <EmployeeMonthCalendar
            onSelectDate={onSelectDate}
            date={group.month}
            selectedScheduleDates={selectedScheduleDates}
            scheduleDates={group.scheduleDates}
          />
        </Grid>
      ))}
    </Grid>
  );
};
const useStyles = makeStyles(theme => ({
  calendarContainer: {
    padding: theme.spacing(),
  },
  loading: {
    padding: `${theme.typography.pxToRem(25)} !important`,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: theme.typography.pxToRem(800),
  },
}));
