/* eslint-disable react-hooks/exhaustive-deps */
import {
  FormControlLabel,
  Grid,
  makeStyles,
  RadioGroup,
  Radio,
} from "@material-ui/core";
import { isValid, format, parseISO } from "date-fns";
import { useQueryBundle } from "graphql/hooks";
import {
  DayPart,
  FeatureFlag,
  PositionScheduleDate,
} from "graphql/server-types.gen";
import * as React from "react";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { GetEmployeeScheduleTimes } from "./graphql/get-employee-schedule-times.gen";
import { ScheduleTimes, dayPartToTimesLabel, dayPartToLabel } from "./helpers";
import { TimeInput } from "../form/time-input";
import { useTranslation } from "react-i18next";
import { FieldError } from "react-hook-form/dist/types";

export type DayPartValue =
  | { part: Exclude<DayPart, DayPart.Hourly> | undefined }
  | { part: DayPart.Hourly; start?: Date; end?: Date };

export type Props = {
  value: DayPartValue;
  onDayPartChange?: (value: DayPartValue) => void;
  organizationId: string;
  startDate: Date;
  employeeId: string;
  startTimeError?: FieldError;
  endTimeError?: FieldError;
  disabled?: boolean;
};

export const DayPartField: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles({});
  const {
    onDayPartChange: dayPartChangeCallback,
    organizationId,
    employeeId,
    startDate,
    value,
    startTimeError,
    endTimeError,
    disabled,
  } = props;

  const featureFlags = useOrgFeatureFlags(organizationId);
  const dayPartOptions = useMemo(
    () => featureFlagsToDayPartOptions(featureFlags),
    [featureFlags]
  );

  const getEmployeeScheduleTimes = useQueryBundle(GetEmployeeScheduleTimes, {
    variables: {
      id: employeeId,
      fromDate: isValid(startDate) ? format(startDate, "P") : undefined,
      toDate: isValid(startDate) ? format(startDate, "P") : undefined,
    },
    skip: !isValid(startDate),
  });
  const employeeScheduleTimes: ScheduleTimes | undefined = useMemo(() => {
    if (
      getEmployeeScheduleTimes.state === "DONE" ||
      getEmployeeScheduleTimes.state === "UPDATING"
    ) {
      const scheduleTimes =
        getEmployeeScheduleTimes.data?.employee?.employeePositionSchedule &&
        getEmployeeScheduleTimes.data?.employee?.employeePositionSchedule
          .length > 0
          ? (getEmployeeScheduleTimes.data?.employee
              ?.employeePositionSchedule[0] as Pick<
              // TODO: this does not handle variants will for multi-day absences
              PositionScheduleDate,
              | "startTimeLocal"
              | "endTimeLocal"
              | "halfDayMorningEndLocal"
              | "halfDayAfternoonStartLocal"
            >)
          : undefined;

      if (!scheduleTimes) {
        return undefined;
      }

      return {
        startTime: format(parseISO(scheduleTimes.startTimeLocal), "h:mm a"),
        halfDayMorningEnd: scheduleTimes.halfDayMorningEndLocal
          ? format(parseISO(scheduleTimes.halfDayMorningEndLocal), "h:mm a")
          : null,
        halfDayAfternoonStart: scheduleTimes.halfDayAfternoonStartLocal
          ? format(parseISO(scheduleTimes.halfDayAfternoonStartLocal), "h:mm a")
          : null,
        endTime: format(parseISO(scheduleTimes.endTimeLocal), "h:mm a"),
      };
    }
  }, [getEmployeeScheduleTimes]);
  useEffect(() => {
    if (
      !value.part &&
      dayPartOptions &&
      dayPartOptions[0] &&
      dayPartChangeCallback
    ) {
      // Default the Day Part selection to the first one
      dayPartChangeCallback({ part: dayPartOptions[0] });
    }
  }, [dayPartOptions]);

  const [incompleteStartTime, setIncompleteStartTime] = useState<string>();
  const [incompleteEndTime, setIncompleteEndTime] = useState<string>();

  const onDayPartChange = useCallback(
    event => {
      if (!dayPartChangeCallback) return;
      /* const newValue: DayPartValue = event.target.value === DayPart.Hourly ? {part: event.target.value, start: } */
      dayPartChangeCallback({ ...value, part: event.target.value });
    },
    [dayPartChangeCallback]
  );

  const setStartTime = useCallback(
    (t: string, valid: boolean) => {
      if (value.part === DayPart.Hourly && dayPartChangeCallback) {
        const parsed = parseISO(t);
        if (valid || t === "")
          dayPartChangeCallback({
            ...value,
            start: valid ? parsed : undefined,
          });
        setIncompleteStartTime(valid ? undefined : t);
      }
    },
    [value, setIncompleteStartTime, onDayPartChange]
  );

  const setEndTime = useCallback(
    (t: string, valid: boolean) => {
      if (value.part === DayPart.Hourly && dayPartChangeCallback) {
        if (valid || t === "")
          dayPartChangeCallback({
            ...value,
            end: valid ? parseISO(t) : undefined,
          });
        setIncompleteEndTime(valid ? undefined : t);
      }
    },
    [value, setIncompleteEndTime, onDayPartChange]
  );

  const showFullDayOption = useMemo(() => {
    return (
      employeeScheduleTimes?.halfDayAfternoonStart &&
      employeeScheduleTimes?.halfDayMorningEnd
    );
  }, [employeeScheduleTimes]);

  return (
    <>
      <RadioGroup
        onChange={onDayPartChange}
        aria-label="dayPart"
        className={classes.radioGroup}
      >
        {dayPartOptions.map(type => {
          const timeDisplay = employeeScheduleTimes
            ? dayPartToTimesLabel(type, employeeScheduleTimes)
            : "";

          // Hide the full day option if we don't have both half days in the schedule
          if (type === DayPart.FullDay && !showFullDayOption) {
            return <div key={type}></div>;
          }
          if (timeDisplay) {
            return (
              <Grid
                container
                justify="space-between"
                alignItems="center"
                key={type}
              >
                <Grid item xs={10}>
                  <FormControlLabel
                    value={type}
                    control={<Radio checked={type === value.part} />}
                    disabled={disabled}
                    label={`${t(dayPartToLabel(type))} ${timeDisplay}`}
                  />
                </Grid>
                <Grid item xs={2}>
                  {dayPartToIcon(type, classes)}
                </Grid>
              </Grid>
            );
          }
        })}
      </RadioGroup>

      {value.part === DayPart.Hourly && (
        <div className={classes.hourlyTimes}>
          <div className={classes.time}>
            <TimeInput
              disabled={props.disabled}
              label=""
              value={
                incompleteStartTime !== undefined
                  ? incompleteStartTime
                  : value.start?.toISOString()
              }
              onValidTime={time => setStartTime(time, true)}
              onChange={time => setStartTime(time, false)}
              inputStatus={startTimeError ? "error" : undefined}
              validationMessage={startTimeError?.message}
            />
          </div>
          <div className={classes.time}>
            <TimeInput
              disabled={props.disabled}
              label=""
              value={
                incompleteEndTime !== undefined
                  ? incompleteEndTime
                  : value.end?.toISOString()
              }
              onValidTime={time => setEndTime(time, true)}
              onChange={time => setEndTime(time, false)}
              earliestTime={value.start?.toISOString()}
              inputStatus={endTimeError ? "error" : undefined}
              validationMessage={endTimeError?.message}
            />
          </div>
        </div>
      )}
    </>
  );
};

const featureFlagsToDayPartOptions = (
  featureFlags: FeatureFlag[]
): DayPart[] => {
  const dayPartOptions: DayPart[] = [];
  // Day Part options have to be in a specific order
  if (featureFlags.includes(FeatureFlag.FullDayAbsences)) {
    dayPartOptions.push(DayPart.FullDay);
  }

  if (featureFlags.includes(FeatureFlag.HalfDayAbsences)) {
    dayPartOptions.push(DayPart.HalfDayMorning);
    dayPartOptions.push(DayPart.HalfDayAfternoon);
  }

  if (featureFlags.includes(FeatureFlag.QuarterDayAbsences)) {
    dayPartOptions.push(DayPart.QuarterDayEarlyMorning);
    dayPartOptions.push(DayPart.QuarterDayLateMorning);
    dayPartOptions.push(DayPart.QuarterDayEarlyAfternoon);
    dayPartOptions.push(DayPart.QuarterDayLateAfternoon);
  }

  // Add Hourly last
  if (featureFlags.includes(FeatureFlag.HourlyAbsences)) {
    dayPartOptions.push(DayPart.Hourly);
  }

  return dayPartOptions;
};

const dayPartToIcon = (dayPart: DayPart, classes: any): React.ReactFragment => {
  switch (dayPart) {
    case DayPart.FullDay:
      return (
        <img
          src={require("ui/icons/full-day.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.HalfDayMorning:
      return (
        <img
          src={require("ui/icons/half-day-am.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.HalfDayAfternoon:
      return (
        <img
          src={require("ui/icons/half-day-pm.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.Hourly:
      return (
        <img
          src={require("ui/icons/partial-day.svg")}
          className={classes.dayPartIcon}
        />
      );
    case DayPart.QuarterDayEarlyMorning:
    case DayPart.QuarterDayLateMorning:
    case DayPart.QuarterDayEarlyAfternoon:
    case DayPart.QuarterDayLateAfternoon:
    default:
      return "";
  }
};

const useStyles = makeStyles(theme => ({
  radioGroup: {
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  hourlyTimes: {
    paddingLeft: theme.spacing(4),
    display: "flex",
  },
  time: {
    width: "40%",
    paddingLeft: theme.spacing(),
  },
  dayPartIcon: {
    height: theme.spacing(3),
  },
}));
