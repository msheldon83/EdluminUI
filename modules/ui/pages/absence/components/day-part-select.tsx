import { makeStyles } from "@material-ui/core";
import { parseISO } from "date-fns";
import {
  DayPart,
  FeatureFlag,
} from "graphql/server-types.gen";
import * as React from "react";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useOrgFeatureFlags } from "reference-data/org-feature-flags";
import { useTranslation } from "react-i18next";
import {
  dayPartToLabel,
} from "ui/components/absence/helpers";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { TimeInput } from "ui/components/form/time-input";
import { compact } from "lodash-es";
import { ScheduleTimes } from "helpers/absence/use-employee-schedule-times";

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
  scheduleTimes: ScheduleTimes | undefined;
};

export const DayPartSelect: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles({});
  const {
    onDayPartChange,
    organizationId,
    value,
    disabled,
    includeHourly,
    timeError,
    scheduleTimes
  } = props;

  const featureFlags = useOrgFeatureFlags(organizationId);
  const dayPartOptions = useMemo(
    () => featureFlagsToDayPartOptions(featureFlags, includeHourly),
    [featureFlags, includeHourly]
  );

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
    return compact(
      dayPartOptions.map(type => {
        const timeDisplay = scheduleTimes
          ? dayPartToTimesLabel(type, scheduleTimes) ?? ""
          : "";

        if (!timeDisplay && type !== DayPart.Hourly) {
          return null;
        }

        const label = `${dayPartToLabel(type)} ${timeDisplay}`;
        return {
          value: type,
          label: label,
        };
      })
    );
  }, [dayPartOptions, scheduleTimes]);

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
        disabled={disabled}
      />

      {value?.part === DayPart.Hourly && (
        <>
          <div className={classes.time}>
            <TimeInput
              disabled={disabled}
              label={t("Start")}
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
              label={t("End")}
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
    alignItems: "flex-start",
    width: "100%",
  },
  dayPart: {
    width: "100%",
  },
  time: {
    paddingLeft: theme.spacing(),
  },
}));

const dayPartToTimesLabel = (dayPart: DayPart, times: ScheduleTimes) => {
  switch (dayPart) {
    case DayPart.FullDay:
      return `(${times.startTime} - ${times.endTime})`;
    case DayPart.HalfDayMorning:
      return times.halfDayMorningEnd
        ? `(${times.startTime} - ${times.halfDayMorningEnd})`
        : null;
    case DayPart.HalfDayAfternoon:
      return times.halfDayAfternoonStart
        ? `(${times.halfDayAfternoonStart} - ${times.endTime})`
        : null;
    case DayPart.Hourly:
    case DayPart.QuarterDayEarlyMorning:
    case DayPart.QuarterDayLateMorning:
    case DayPart.QuarterDayEarlyAfternoon:
    case DayPart.QuarterDayLateAfternoon:
    default:
      return "";
  }
};
