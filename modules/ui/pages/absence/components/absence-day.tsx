import * as React from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetail } from "../types";
import { OptionType, Select } from "ui/components/form/select";
import { makeStyles } from "@material-ui/core";
import { DayPart } from "graphql/server-types.gen";
import {
  DayPartSelect,
  DayPartValue,
  DayPartTimesVary,
} from "./day-part-select";
import { ScheduleTimes } from "helpers/absence/use-employee-schedule-times";

type Props = {
  organizationId: string;
  employeeId: string;
  travellingEmployee: boolean;
  detail: AbsenceDetail;
  absenceReasonOptions: OptionType[];
  canEditReason: boolean;
  canEditTimes: boolean;
  showReason: boolean;
  showDayPart: boolean;
  onReasonChange: (absenceReasonId: string) => void;
  reasonError?: string;
  onTimeChange: (
    dayPart: DayPart,
    hourlyStartTime?: Date,
    hourlyEndTime?: Date
  ) => void;
  timeError?: {
    dayPartError?: string | undefined;
    hourlyStartTimeError?: string | undefined;
    hourlyEndTimeError?: string | undefined;
  };
  subTitle?: string;
  scheduleTimes: ScheduleTimes | undefined;
  dayPartTimesVary: DayPartTimesVary[];
};

export const AbsenceDay: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const {
    detail,
    absenceReasonOptions,
    canEditReason,
    canEditTimes,
    showReason,
    showDayPart,
    subTitle,
    organizationId,
    employeeId,
    onReasonChange,
    onTimeChange,
    reasonError,
    timeError,
    travellingEmployee,
    scheduleTimes,
    dayPartTimesVary,
  } = props;

  const dayPartValue = React.useMemo(() => {
    if (!detail.dayPart) {
      return undefined;
    }

    const value: DayPartValue = { part: detail.dayPart };
    if (value.part === DayPart.Hourly) {
      value.start = detail.hourlyStartTime;
      value.end = detail.hourlyEndTime;
    }
    return value;
  }, [detail]);

  return (
    <div>
      <div className={classes.subTitle}>{subTitle}</div>
      {showReason && (
        <Select
          label={t("Reason")}
          value={{
            value: detail.absenceReasonId ?? "",
            label:
              absenceReasonOptions.find(a => a.value === detail.absenceReasonId)
                ?.label || "",
          }}
          onChange={value => onReasonChange(value.value.toString())}
          multiple={false}
          options={absenceReasonOptions}
          inputStatus={reasonError ? "error" : undefined}
          validationMessage={reasonError}
          withResetValue={false}
          disabled={!canEditReason}
        />
      )}
      {showDayPart && (
        <div className={classes.dayPartSelection}>
          <DayPartSelect
            value={dayPartValue}
            date={detail.date}
            organizationId={organizationId}
            employeeId={employeeId}
            disabled={!canEditTimes}
            onDayPartChange={value => {
              if (value?.part) {
                onTimeChange(
                  value.part,
                  value.part === DayPart.Hourly ? value.start : undefined,
                  value.part === DayPart.Hourly ? value.end : undefined
                );
              }
            }}
            timeError={timeError}
            includeHourly={travellingEmployee}
            scheduleTimes={scheduleTimes}
            dayPartTimesVary={dayPartTimesVary}
          />
        </div>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  dayPartSelection: {
    marginTop: theme.spacing(),
  },
  subTitle: {
    fontWeight: "bold",
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
  },
}));
