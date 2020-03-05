import * as React from "react";
import { VacancyReason, VacancyDetailInput } from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import { OptionsType, OptionTypeBase } from "react-select";
import { Grid, Typography, makeStyles } from "@material-ui/core";
import { format, parseISO, isValid } from "date-fns";
import { TextButton } from "ui/components/text-button";
import { TimeInput } from "ui/components/form/time-input";
import { useTranslation } from "react-i18next";
import {
  midnightTime,
  secondsSinceMidnight,
  timeStampToIso,
  parseTimeFromString,
  isoToTimestamp,
  humanizeTimeStamp,
} from "helpers/time";

type Props = {
  vacancyDetail: VacancyDetailInput;
  vacancyReasonOptions: OptionType[];
  dayParts: {
    id: string;
    label: string;
    start: any;
    end: any;
  }[];
  setVacancyDetailReason: (value: VacancyDetailInput) => void;
  setVacancyDetailTimes: (value: VacancyDetailInput) => void;
  showCopyPast: boolean;
};

export const VacancyIndividualDay: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    vacancyDetail,
    vacancyReasonOptions,
    showCopyPast,
    setVacancyDetailReason,
    setVacancyDetailTimes,
    dayParts,
  } = props;

  const [startTime, setStartTime] = useState(vacancyDetail.startTime);
  const [endTime, setEndTime] = useState<string>(vacancyDetail.endTime);
  const [showCustom, setShowCustom] = useState(false);

  const timeOptions = useMemo(() => {
    return dayParts.map((dp: any) => ({ label: dp.label, value: dp.id }));
  }, [props, dayParts]);

  const getTimeValue = React.useCallback(() => {
    if ((!vacancyDetail.startTime || !vacancyDetail.endTime) && !showCustom) {
      return "full";
    } else if (
      vacancyDetail.startTime ===
        dayParts.find(d => {
          return d.id === "full";
        })?.start &&
      vacancyDetail.endTime ===
        dayParts.find(d => {
          return d.id === "full";
        })?.end &&
      !showCustom
    ) {
      return "full";
    } else if (
      vacancyDetail.startTime ===
        dayParts.find(d => {
          return d.id === "halfDayAM";
        })?.start &&
      vacancyDetail.endTime ===
        dayParts.find(d => {
          return d.id === "halfDayAM";
        })?.end
    ) {
      return "halfDayAM";
    } else if (
      vacancyDetail.startTime ===
        dayParts.find(d => {
          return d.id === "halfDayPM";
        })?.start &&
      vacancyDetail.endTime ===
        dayParts.find(d => {
          return d.id === "halfDayPM";
        })?.end
    ) {
      return "halfDayPM";
    } else {
      return "custom";
    }
  }, [timeOptions]);

  const updateVacancyDetailTimes = React.useCallback(
    (timeId: string) => {
      const sTime: number =
        timeId !== "custom"
          ? dayParts.find(d => {
              return d.id === timeId;
            })?.start
          : startTime;
      const eTime: number =
        timeId !== "custom"
          ? dayParts.find(d => {
              return d.id === timeId;
            })?.end
          : endTime;
      const newVacDetail = {
        ...vacancyDetail,
        startTime: sTime,
        endTime: eTime,
      };
      setShowCustom(timeId === "custom");
      setVacancyDetailTimes(newVacDetail);
    },
    [props, dayParts]
  );

  const handleSetStartTime = (t: string, valid: boolean) => {
    if (valid) {
      const newVacDetail = {
        ...vacancyDetail,
        startTime: secondsSinceMidnight(isoToTimestamp(t)),
      };
      setVacancyDetailTimes(newVacDetail);
    }
    setStartTime(t);
  };

  const handleSetEndTime = (t: string, valid: boolean) => {
    if (valid) {
      const newVacDetail = {
        ...vacancyDetail,
        endTime: secondsSinceMidnight(isoToTimestamp(t)),
      };
      setVacancyDetailTimes(newVacDetail);
    }
    setEndTime(t);
  };

  //default properties

  useEffect(() => {
    if (
      (!startTime && vacancyDetail.startTime) ||
      (getTimeValue() !== "custom" && vacancyDetail.startTime) ||
      (getTimeValue() === "custom" && startTime !== vacancyDetail.startTime)
    ) {
      setStartTime(
        format(
          parseISO(
            timeStampToIso(midnightTime().setSeconds(vacancyDetail.startTime))
          ),
          "h:mm a"
        )
      );
    }
    if (
      (!endTime && vacancyDetail.endTime) ||
      (getTimeValue() !== "custom" && vacancyDetail.endTime)
    ) {
      setEndTime(
        format(
          parseISO(
            timeStampToIso(midnightTime().setSeconds(vacancyDetail.endTime))
          ),
          "h:mm a"
        )
      );
    }
  }, [vacancyDetail.startTime, vacancyDetail.endTime]);

  return (
    <>
      <Grid container justify="space-between">
        <Grid item xs={9}>
          <Typography>{format(vacancyDetail.date, "EEE, MMM d")}</Typography>
        </Grid>
        {showCopyPast && (
          <Grid item xs={3}>
            <TextButton>Copy</TextButton>
            <TextButton>Paste</TextButton>
          </Grid>
        )}
        <Grid item xs={12}>
          <Select
            multiple={false}
            withResetValue={false}
            options={vacancyReasonOptions}
            value={{
              value:
                vacancyDetail.vacancyReasonId ?? vacancyReasonOptions[0].value,
              label:
                vacancyReasonOptions.find(a =>
                  vacancyDetail.vacancyReasonId
                    ? a.value === vacancyDetail.vacancyReasonId
                    : a.value === vacancyReasonOptions[0].value
                )?.label || "",
            }}
            onChange={async (e: OptionType) => {
              let selectedValue: any = null;
              if (e) {
                selectedValue = (e as OptionTypeBase).value;
              }
              const newVacDetail = {
                ...vacancyDetail,
                vacancyReasonId: selectedValue,
              };
              setVacancyDetailReason(newVacDetail);
            }}
          ></Select>
        </Grid>
        {getTimeValue() !== "custom" && (
          <Grid item xs={12}>
            <Select
              multiple={false}
              options={timeOptions}
              withResetValue={false}
              value={{
                value: getTimeValue(),
                label:
                  timeOptions.find(d => d.value === getTimeValue())?.label ||
                  "",
              }}
              onChange={async (e: OptionType) => {
                let selectedValue: any = null;
                if (e) {
                  selectedValue = (e as OptionTypeBase).value;
                }
                updateVacancyDetailTimes(selectedValue);
              }}
            ></Select>
          </Grid>
        )}
        {getTimeValue() === "custom" && (
          <Grid item xs={7}>
            <Select
              multiple={false}
              options={timeOptions}
              withResetValue={false}
              value={{
                value: getTimeValue(),
                label:
                  timeOptions.find(d => d.value === getTimeValue())?.label ||
                  "",
              }}
              onChange={async (e: OptionType) => {
                let selectedValue: any = null;
                if (e) {
                  selectedValue = (e as OptionTypeBase).value;
                }
                updateVacancyDetailTimes(selectedValue);
              }}
            ></Select>
          </Grid>
        )}
        {getTimeValue() === "custom" && (
          <Grid item xs={5}>
            <TimeInput
              placeHolder={t("Start time")}
              value={startTime}
              className={classes.time}
              label=""
              onValidTime={(v: string) => {
                handleSetStartTime(v, true);
              }}
              onChange={(v: string) => {
                handleSetStartTime(v, false);
              }}
            />

            <TimeInput
              placeHolder={t("End time")}
              className={classes.time}
              value={endTime}
              label=""
              onValidTime={(v: string) => {
                handleSetEndTime(v, true);
                setEndTime(v);
              }}
              onChange={(v: string) => {
                handleSetEndTime(v, false);
                setEndTime(v);
              }}
            />
          </Grid>
        )}
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  time: {
    width: "45%",
    paddingLeft: theme.spacing(),
  },

  hourlyTimes: {
    paddingLeft: theme.spacing(4),
    display: "flex",
  },
}));
