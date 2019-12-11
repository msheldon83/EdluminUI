import * as React from "react";
import { useTranslation } from "react-i18next";
import { makeStyles, Grid, Button, Typography } from "@material-ui/core";
import {
  EmployeeAbsenceDetail,
  ScheduleDate,
} from "ui/components/employee/types";
import { useState, useMemo, useEffect } from "react";
import { EmployeeMonthCalendar } from "./employee-month-calendar";
import { GetEmployeePositionContractSchedule } from "ui/components/employee/graphql/get-employee-position-contract-schedule.gen";
import { useQueryBundle } from "graphql/hooks";
import {
  GetContractDates,
  GetPositionScheduleDates,
  GroupEmployeeScheduleByMonth,
} from "ui/components/employee/helpers";
import { SelectedDateView } from "./selected-date-view";
import { isSameMonth, parseISO, isSameDay } from "date-fns";

type Props = {
  employeeId: string | undefined;
  startDate: Date;
  endDate: Date;
  absences: EmployeeAbsenceDetail[];
  cancelAbsence: (absenceId: string) => Promise<void>;
};

export const CalendarView: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const [selectedScheduleDates, setSelectedScheduleDates] = useState<
    ScheduleDate[]
  >([]);
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
        fromDate: props.startDate,
        toDate: props.endDate,
      },
      skip: !props.employeeId,
    }
  );
  const positionSchedule =
    getEmployeeSchedule.state === "LOADING" ||
    getEmployeeSchedule.state === "UPDATING"
      ? []
      : (getEmployeeSchedule.data?.employee
          ?.employeePositionSchedule as GetEmployeePositionContractSchedule.EmployeePositionSchedule[]);
  const contractSchedule =
    getEmployeeSchedule.state === "LOADING" ||
    getEmployeeSchedule.state === "UPDATING"
      ? []
      : (getEmployeeSchedule.data?.employee
          ?.employeeContractSchedule as GetEmployeePositionContractSchedule.EmployeeContractSchedule[]);

  const monthGroups = useMemo(
    () =>
      GroupEmployeeScheduleByMonth(
        props.startDate,
        props.endDate,
        props.absences,
        GetContractDates(contractSchedule),
        GetPositionScheduleDates(positionSchedule)
      ),
    [
      props.absences,
      props.startDate,
      props.endDate,
      positionSchedule,
      contractSchedule,
    ]
  );

  // Default to Today if it exists in the current set of Months
  useEffect(() => {
    if (
      monthGroups &&
      monthGroups.length > 0 &&
      selectedScheduleDates.length === 0
    ) {
      const currentMonth = monthGroups.find(m =>
        isSameMonth(parseISO(m.month), today)
      );
      if (currentMonth) {
        setSelectedScheduleDates(
          currentMonth.scheduleDates.filter(s => isSameDay(s.date, today))
        );
      }
    }
  }, [monthGroups, today, selectedScheduleDates.length]);

  return (
    <Grid container>
      <Grid item xs={12}>
        {selectedScheduleDates && selectedScheduleDates.length > 0 && (
          <SelectedDateView
            scheduleDates={selectedScheduleDates}
            selectedDate={selectedScheduleDates[0].date}
            cancelAbsence={props.cancelAbsence}
          />
        )}
      </Grid>
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
  subText: {
    color: theme.customColors.edluminSubText,
    fontWeight: "normal",
  },
}));
