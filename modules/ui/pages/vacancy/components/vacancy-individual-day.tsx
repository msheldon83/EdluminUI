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
  secondsSinceMidnight,
  isoToTimestamp,
  secondsToFormattedHourMinuteString,
} from "helpers/time";

type Props = {
  vacancyDetail: VacancyDetailInput;
  vacancyReasonOptions: OptionType[];
  payCodeOptions: OptionType[];
  defaultPayCodeId?: string;
  accountingCodeOptions: OptionType[];
  dayParts: {
    id: string;
    label: string;
    start: any;
    end: any;
  }[];
  setVacancyDetailReason: (value: VacancyDetailInput) => void;
  setVacancyDetailTimes: (value: VacancyDetailInput) => void;
  setVacancyPayCode: (value: VacancyDetailInput) => void;
  setVacancyAccountingCode: (value: VacancyDetailInput) => void;
  showCopyPaste: boolean;
  subTitle?: string;
  disableTime?: boolean;
  disableReason?: boolean;
  disablePayCode?: boolean;
  disableAccountingCode?: boolean;
};

export const VacancyIndividualDay: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const {
    vacancyDetail,
    vacancyReasonOptions,
    payCodeOptions,
    accountingCodeOptions,
    showCopyPaste,
    setVacancyDetailReason,
    setVacancyDetailTimes,
    setVacancyPayCode,
    setVacancyAccountingCode,
    dayParts,
    subTitle,
    defaultPayCodeId,
    disableTime = false,
    disableReason = false,
    disablePayCode = false,
    disableAccountingCode = false,
  } = props;

  const [startTime, setStartTime] = useState(vacancyDetail.startTime);
  const [endTime, setEndTime] = useState<string>(vacancyDetail.endTime);
  const [showCustom, setShowCustom] = useState(false);

  const timeOptions = useMemo(() => {
    return dayParts.map((dp: any) => ({ label: dp.label, value: dp.id }));
  }, [props, dayParts]); /* eslint-disable-line react-hooks/exhaustive-deps */

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
  }, [timeOptions]); /* eslint-disable-line react-hooks/exhaustive-deps */

  const updateVacancyDetailTimes = React.useCallback(
    (timeId: string) => {
      const sTime: number = dayParts.find(d => {
        return d.id === timeId;
      })?.start;
      const eTime: number = dayParts.find(d => {
        return d.id === timeId;
      })?.end;
      const newVacDetail = {
        ...vacancyDetail,
        startTime: sTime,
        endTime: eTime,
      };
      setShowCustom(timeId === "custom");
      setVacancyDetailTimes(newVacDetail);
    },
    [props, dayParts] /* eslint-disable-line react-hooks/exhaustive-deps */
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

  useEffect(
    () => {
      if (
        (!startTime && vacancyDetail.startTime) ||
        (getTimeValue() !== "custom" && vacancyDetail.startTime) ||
        (getTimeValue() === "custom" && startTime !== vacancyDetail.startTime)
      ) {
        setStartTime(
          secondsToFormattedHourMinuteString(vacancyDetail.startTime)
        );
      }
      if (
        (!endTime && vacancyDetail.endTime) ||
        (getTimeValue() !== "custom" && vacancyDetail.endTime)
      ) {
        setEndTime(secondsToFormattedHourMinuteString(vacancyDetail.endTime));
      }
    },
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [vacancyDetail.startTime, vacancyDetail.endTime]
  );

  console.log(vacancyDetail.accountingCodeAllocations);

  return (
    <>
      <Grid container justify="space-between" spacing={2}>
        <Grid item xs={9}>
          <label>
            {subTitle ? subTitle : format(vacancyDetail.date, "EEE, MMM d")}
          </label>
        </Grid>
        {showCopyPaste && (
          <Grid item xs={3}>
            <TextButton>{t("Copy")}</TextButton>
            <TextButton>{t("Paste")}</TextButton>
          </Grid>
        )}
        <Grid item xs={12}>
          <Select
            multiple={false}
            withResetValue={false}
            options={vacancyReasonOptions}
            disabled={disableReason}
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
              disabled={disableTime}
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
          <>
            <Grid item xs={6}>
              <Select
                multiple={false}
                options={timeOptions}
                disabled={disableTime}
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
            <Grid item xs={3}>
              <TimeInput
                placeHolder={t("Start time")}
                value={startTime}
                label=""
                onValidTime={(v: string) => {
                  handleSetStartTime(v, true);
                }}
                onChange={(v: string) => {
                  handleSetStartTime(v, false);
                }}
              />
            </Grid>
            <Grid item xs={3}>
              <TimeInput
                placeHolder={t("End time")}
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
          </>
        )}
        <Grid item xs={6}>
          <Select
            multiple={false}
            withResetValue={true}
            options={payCodeOptions}
            disabled={disablePayCode}
            value={{
              value: vacancyDetail.payCodeId ?? "",
              label:
                vacancyDetail.payCodeId && vacancyDetail.payCodeId.length > 0
                  ? payCodeOptions.find(
                      a =>
                        a.value === vacancyDetail.payCodeId ?? defaultPayCodeId
                    )?.label || ""
                  : "",
            }}
            onChange={async (e: OptionType) => {
              let selectedValue: any = null;
              if (e) {
                selectedValue = (e as OptionTypeBase).value;
              }
              const newVacDetail = {
                ...vacancyDetail,
                payCodeId:
                  selectedValue && selectedValue.length > 0
                    ? selectedValue
                    : undefined,
              };
              setVacancyPayCode(newVacDetail);
            }}
          ></Select>
        </Grid>
        <Grid item xs={6}>
          <Select
            multiple={false}
            withResetValue={true}
            options={accountingCodeOptions}
            disabled={disableAccountingCode}
            value={{
              value:
                vacancyDetail.accountingCodeAllocations &&
                vacancyDetail.accountingCodeAllocations.length > 0
                  ? vacancyDetail.accountingCodeAllocations[0]
                      ?.accountingCodeId || ""
                  : "",
              label:
                vacancyDetail.accountingCodeAllocations &&
                vacancyDetail.accountingCodeAllocations.length > 0
                  ? accountingCodeOptions.find(
                      a =>
                        a.value ===
                        vacancyDetail.accountingCodeAllocations![0]
                          ?.accountingCodeId
                    )?.label || ""
                  : "",
            }}
            onChange={async (e: OptionType) => {
              let selectedValue: any = null;
              if (e) {
                selectedValue = (e as OptionTypeBase).value;
              }
              const accountingCodeAllocations =
                selectedValue && selectedValue.length > 0
                  ? [{ accountingCodeId: selectedValue, allocation: 1.0 }]
                  : [];
              const newVacDetail = {
                ...vacancyDetail,
                accountingCodeAllocations,
              };
              setVacancyAccountingCode(newVacDetail);
            }}
          ></Select>
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({}));
