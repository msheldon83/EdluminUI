import { makeStyles } from "@material-ui/core";
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
import { useTranslation } from "react-i18next";
import { GetEmployeeScheduleTimes } from "ui/components/absence/graphql/get-employee-schedule-times.gen";
import {
  ScheduleTimes,
  dayPartToTimesLabel,
  dayPartToLabel,
} from "ui/components/absence/helpers";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { TimeInput } from "ui/components/form/time-input";

export type DayPartValue =
  | { part: Exclude<DayPart, DayPart.Hourly> | undefined }
  | { part: DayPart.Hourly; start?: Date; end?: Date };

export type Props = {
  value: DayPartValue | undefined;
  onDayPartChange: (value: DayPartValue) => void;
  date: Date;
  organizationId: string;
  employeeId: string;
  disabled?: boolean;
  includeHourly?: boolean;
  timeError?: {
    dayPartError?: string | undefined;
    hourlyStartTimeError?: string | undefined;
    hourlyEndTimeError?: string | undefined;
  };
};

export const DayPartSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles({});
  const {
    onDayPartChange,
    organizationId,
    employeeId,
    date,
    value,
    disabled,
    includeHourly,
    timeError,
  } = props;

  const featureFlags = useOrgFeatureFlags(organizationId);
  const dayPartOptions = useMemo(
    () => featureFlagsToDayPartOptions(featureFlags, includeHourly),
    [featureFlags, includeHourly]
  );

  const getEmployeeScheduleTimes = useQueryBundle(GetEmployeeScheduleTimes, {
    variables: {
      id: employeeId,
      fromDate: isValid(date) ? format(date, "P") : undefined,
      toDate: isValid(date) ? format(date, "P") : undefined,
    },
    skip: !isValid(date),
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
    if (!value?.part && dayPartOptions && dayPartOptions[0]) {
      // Default the Day Part selection to the first one
      onDayPartChange({ part: dayPartOptions[0] });
    }
  }, [dayPartOptions, onDayPartChange, value?.part]);

  const [incompleteStartTime, setIncompleteStartTime] = useState<string>();
  const [incompleteEndTime, setIncompleteEndTime] = useState<string>();

  const setStartTime = useCallback(
    (t: string, valid: boolean) => {
      if (value && value?.part === DayPart.Hourly) {
        const parsed = parseISO(t);
        if (valid || t === "")
          onDayPartChange({
            ...value,
            start: valid ? parsed : undefined,
          });
        setIncompleteStartTime(valid ? undefined : t);
      }
    },
    [onDayPartChange, value]
  );

  const setEndTime = useCallback(
    (t: string, valid: boolean) => {
      if (value && value?.part === DayPart.Hourly) {
        if (valid || t === "")
          onDayPartChange({
            ...value,
            end: valid ? parseISO(t) : undefined,
          });
        setIncompleteEndTime(valid ? undefined : t);
      }
    },
    [onDayPartChange, value]
  );

  const options: OptionType[] = useMemo(() => {
    return dayPartOptions.map(type => {
      const timeDisplay = employeeScheduleTimes
        ? dayPartToTimesLabel(type, employeeScheduleTimes) ?? ""
        : "";
      const label = `${dayPartToLabel(type)} ${timeDisplay}`;
      return {
        value: type,
        label: label,
      };
    });
  }, [dayPartOptions, employeeScheduleTimes]);

  return (
    <div className={classes.container}>
      <SelectNew
        label={t("Times")}
        value={
          value?.part
            ? {
                value: value.part,
                label: options.find(a => a.value === value.part)?.label || "",
              }
            : { value: "", label: "" }
        }
        onChange={value =>
          onDayPartChange({ ...value, part: value.value as DayPart })
        }
        multiple={false}
        options={options}
        inputStatus={timeError?.dayPartError ? "error" : undefined}
        validationMessage={timeError?.dayPartError}
        withResetValue={false}
        aria-label="dayPart"
        className={classes.dayPart}
      />

      {value?.part === DayPart.Hourly && (
        <>
          <div className={classes.time}>
            <TimeInput
              disabled={disabled}
              label=""
              value={
                incompleteStartTime !== undefined
                  ? incompleteStartTime
                  : value.start?.toISOString()
              }
              onValidTime={time => setStartTime(time, true)}
              onChange={time => setStartTime(time, false)}
              inputStatus={
                timeError?.hourlyStartTimeError ? "error" : undefined
              }
              validationMessage={timeError?.hourlyStartTimeError}
            />
          </div>
          <div className={classes.time}>
            <TimeInput
              disabled={disabled}
              label=""
              value={
                incompleteEndTime !== undefined
                  ? incompleteEndTime
                  : value.end?.toISOString()
              }
              onValidTime={time => setEndTime(time, true)}
              onChange={time => setEndTime(time, false)}
              earliestTime={value.start?.toISOString()}
              inputStatus={timeError?.hourlyEndTimeError ? "error" : undefined}
              validationMessage={timeError?.hourlyEndTimeError}
            />
          </div>
        </>
      )}
    </div>
  );
};

const featureFlagsToDayPartOptions = (
  featureFlags: FeatureFlag[],
  includeHourly?: boolean
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
  if (featureFlags.includes(FeatureFlag.HourlyAbsences) || includeHourly) {
    dayPartOptions.push(DayPart.Hourly);
  }

  return dayPartOptions;
};

const useStyles = makeStyles(theme => ({
  container: {
    display: "flex",
    alignItems: "flex-end",
    width: "100%",
  },
  dayPart: {
    width: "100%",
  },
  time: {
    paddingLeft: theme.spacing(),
  },
}));
