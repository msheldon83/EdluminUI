import * as React from "react";
import { useState, useMemo, useEffect } from "react";
import { SelectNew as Select, OptionType } from "ui/components/form/select-new";
import { OptionTypeBase } from "react-select";
import { Grid, makeStyles } from "@material-ui/core";
import { format } from "date-fns";
import { TextButton } from "ui/components/text-button";
import { TimeInput } from "ui/components/form/time-input";
import { useTranslation } from "react-i18next";
import {
  secondsSinceMidnight,
  isoToTimestamp,
  secondsToFormattedHourMinuteString,
} from "helpers/time";
import {
  VacancyDayPart,
  VacancyDetailItem,
  VacancyDetailsFormData,
} from "../helpers/types";
import {
  AccountingCodeDropdown,
} from "ui/components/form/accounting-code-dropdown";
import { useFormikContext, FormikErrors } from "formik";
import { isArray } from "lodash-es";
import {
  mapAccountingCodeAllocationsToAccountingCodeValue,
  mapAccountingCodeValueToAccountingCodeAllocations,
  validateAccountingCodeAllocations,
} from "helpers/accounting-code-allocations";

type Props = {
  vacancyDetail: VacancyDetailItem;
  vacancyReasonOptions: OptionType[];
  payCodeOptions: OptionType[];
  defaultPayCodeId?: string;
  accountingCodeOptions: OptionType[];
  dayParts: VacancyDayPart[];
  setVacancyDetailReason: (value: VacancyDetailItem) => void;
  setVacancyDetailTimes: (value: VacancyDetailItem) => void;
  setVacancyPayCode: (value: VacancyDetailItem) => void;
  setVacancyAccountingCode: (value: VacancyDetailItem) => void;
  showCopyPaste: boolean;
  subTitle?: string;
  disableTime?: boolean;
  disableReason?: boolean;
  disablePayCode?: boolean;
  disableAccountingCode?: boolean;
  dayIndex: number;
};

export const VacancyIndividualDay: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { errors } = useFormikContext<VacancyDetailsFormData>();
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
    dayIndex,
    disableTime = false,
    disableReason = false,
    disablePayCode = false,
    disableAccountingCode = false,
  } = props;

  const [startTime, setStartTime] = useState<string | number | undefined>();
  const [endTime, setEndTime] = useState<string | number | undefined>();
  const [showCustom, setShowCustom] = useState(false);
  const [
    accountingCodeValueSelection,
    setAccountingCodeValueSelection,
  ] = useState(
    mapAccountingCodeAllocationsToAccountingCodeValue(
      vacancyDetail.accountingCodeAllocations
    )
  );

  /* eslint-disable react-hooks/exhaustive-deps */
  const timeOptions = useMemo(() => {
    return dayParts.map((dp: any) => ({ label: dp.label, value: dp.id }));
  }, [props, dayParts]); // eslint-disable-line react-hooks/exhaustive-deps

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
  }, [dayParts, vacancyDetail, timeOptions, showCustom]);
  /* eslint-enable react-hooks/exhaustive-deps */

  const updateVacancyDetailTimes = React.useCallback(
    (timeId: string) => {
      const sTime: number | undefined = dayParts.find(d => {
        return d.id === timeId;
      })?.start;
      const eTime: number | undefined = dayParts.find(d => {
        return d.id === timeId;
      })?.end;

      if (sTime && eTime) {
        const newVacDetail = {
          ...vacancyDetail,
          startTime: sTime,
          endTime: eTime,
        };
        setShowCustom(timeId === "custom");
        setVacancyDetailTimes(newVacDetail);
      }
    },
    [
      setVacancyDetailTimes,
      vacancyDetail,
      dayParts,
    ] /* eslint-disable-line react-hooks/exhaustive-deps */
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

  const selectedVacancyReason = useMemo(() => {
    let vacancyReason = vacancyReasonOptions.find(
      a => a.value === vacancyDetail.vacancyReasonId
    );
    if (!vacancyReason && vacancyReasonOptions.length > 0) {
      vacancyReason = vacancyReasonOptions[0];
    }
    return {
      value: vacancyReason?.value ?? "",
      label: vacancyReason?.label ?? "",
    };
  }, [vacancyReasonOptions, vacancyDetail.vacancyReasonId]);

  const accountingCodeError = useMemo(() => {
    const formikError =
      errors?.details && isArray(errors.details) && errors.details[dayIndex]
        ? (errors.details[dayIndex] as FormikErrors<VacancyDetailItem>)
            ?.accountingCodeAllocations
        : undefined;

    if (formikError) {
      // Because we're only validating on submit, we may have a formik
      // error that the User has since fixed, but is still present until
      // the form is submitted again. This will basically run the same validation
      // and ultimately hide the error if the User has fixed the issue
      const currentAllocations = mapAccountingCodeValueToAccountingCodeAllocations(
        accountingCodeValueSelection
      );
      return validateAccountingCodeAllocations(currentAllocations, t);
    }

    return undefined;
  }, [accountingCodeValueSelection, dayIndex, errors?.details, t]);

  return (
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
      {!disableReason && (
        <Grid item xs={12}>
          <Select
            multiple={false}
            withResetValue={false}
            label={t("Vacancy reason")}
            options={vacancyReasonOptions}
            disabled={disableReason}
            value={selectedVacancyReason}
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
      )}
      {getTimeValue() !== "custom" && !disableTime && (
        <Grid item xs={12}>
          <Select
            multiple={false}
            options={timeOptions}
            disabled={disableTime}
            label={t("Times")}
            withResetValue={false}
            value={{
              value: getTimeValue(),
              label:
                timeOptions.find(d => d.value === getTimeValue())?.label || "",
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
      {getTimeValue() === "custom" && !disableTime && (
        <Grid
          item
          xs={12}
          container
          justify="space-between"
          alignItems="flex-end"
          spacing={2}
        >
          <Grid item xs={6}>
            <Select
              multiple={false}
              options={timeOptions}
              disabled={disableTime}
              label={t("Times")}
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
              value={startTime?.toString() ?? ""}
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
              value={endTime?.toString() ?? ""}
              label=""
              earliestTime={startTime ? startTime.toString() : undefined}
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
        </Grid>
      )}
      {payCodeOptions.length > 0 && !disablePayCode && (
        <Grid
          item
          xs={
            accountingCodeOptions.length === 0 ||
            disableAccountingCode ||
            accountingCodeValueSelection?.type === "multiple-allocations"
              ? 12
              : 6
          }
        >
          <Select
            multiple={false}
            withResetValue={true}
            options={payCodeOptions}
            label={t("Pay code")}
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
              let selectedLabel: any = null;
              if (e) {
                selectedValue = (e as OptionTypeBase).value;
                selectedLabel = (e as OptionTypeBase).label;
              }
              const newVacDetail = {
                ...vacancyDetail,
                payCodeId:
                  selectedValue && selectedValue.length > 0
                    ? selectedValue
                    : undefined,
                payCodeName:
                  selectedLabel && selectedLabel.length > 0
                    ? selectedLabel
                    : undefined,
              };
              setVacancyPayCode(newVacDetail);
            }}
          ></Select>
        </Grid>
      )}
      {accountingCodeOptions.length > 0 && !disableAccountingCode && (
        <Grid
          item
          xs={
            payCodeOptions.length === 0 ||
            disablePayCode ||
            accountingCodeValueSelection?.type === "multiple-allocations"
              ? 12
              : 6
          }
        >
          <AccountingCodeDropdown
            value={accountingCodeValueSelection}
            options={accountingCodeOptions}
            disabled={disableAccountingCode}
            onChange={value => {
              setAccountingCodeValueSelection(value);
              const allocations = mapAccountingCodeValueToAccountingCodeAllocations(
                value,
                false,
                 true
              );

              const newVacDetail: VacancyDetailItem = {
                ...vacancyDetail,
                accountingCodeAllocations: allocations,
              };
              setVacancyAccountingCode(newVacDetail);
            }}
            inputStatus={accountingCodeError ? "error" : undefined}
            validationMessage={accountingCodeError}
          />
        </Grid>
      )}
    </Grid>
  );
};

const useStyles = makeStyles(theme => ({}));
