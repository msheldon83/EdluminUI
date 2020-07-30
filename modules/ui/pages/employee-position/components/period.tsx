import * as React from "react";
import {
  Grid,
  makeStyles,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { useMemo, useEffect } from "react";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { TextButton } from "ui/components/text-button";
import { FormikTimespanInput } from "ui/components/form/formik-timespan-input";
import { useTranslation } from "react-i18next";
import { OptionTypeBase } from "react-select/src/types";
import { Period, Schedule, GetError } from "./helpers";
import { GetBellSchedulePeriods } from "../graphql/get-bell-schedule-periods.gen";
import { FormikErrors } from "formik";
import { secondsToFormattedHourMinuteString } from "helpers/time";
import { compact } from "lodash-es";

export type BellSchedule = {
  id: string;
  name: string;
  usages: {
    locationId?: string | null | undefined;
    locationGroupId?: string | null | undefined;
  }[];
  periods: {
    name: string;
    standardPeriod?: {
      startTime: number;
      endTime: number;
    };
  }[];
};

type Props = {
  index: number;
  scheduleIndex: number;
  locationOptions: OptionType[];
  bellSchedules: BellSchedule[];
  period: Period;
  lastPeriod: boolean;
  disableAllDay: boolean;
  onChangeLocation: (locationId: string, index: number) => void;
  onChangeBellSchedule: (bellScheduleId: string, index: number) => void;
  onChangeStartPeriod: (startPeriodId: string, index: number) => void;
  onChangeEndPeriod: (endPeriodId: string, index: number) => void;
  onCheckAllDay: (allDay: boolean) => void;
  onAddSchool: () => void;
  onRemoveSchool: (periodNumber: number) => void;
  scheduleNumber: string;
  errors: FormikErrors<{ schedules: Schedule[] }>;
};

export const PeriodUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const period = props.period;
  const classes = useStyles();
  const index = props.index;

  const bellSchedules = props.bellSchedules;
  const bellScheduleOptions: OptionType[] = useMemo(() => {
    const options: OptionType[] = bellSchedules
      .filter(x =>
        x?.usages?.some(
          u =>
            u?.locationId === period.locationId ||
            u?.locationGroupId === period.locationGroupId
        )
      )
      .map(p => {
        const lines = compact(
          p?.periods
            .filter(
              p =>
                p.standardPeriod &&
                p.standardPeriod.startTime != p.standardPeriod.endTime
            )
            .map(p =>
              p.standardPeriod
                ? `${p.name}: ${secondsToFormattedHourMinuteString(
                    p.standardPeriod.startTime
                  )} - ${secondsToFormattedHourMinuteString(
                    p.standardPeriod.endTime
                  )}`
                : undefined
            )
        );
        const info =
          lines.length == 0 ? (
            undefined
          ) : (
            <>
              <Typography>{t("Standard Periods:")}</Typography>
              {lines.map((l, i) => (
                <Typography key={i}>{l}</Typography>
              ))}
            </>
          );
        return {
          label: p?.name ?? "",
          value: p?.id ?? "",
          info,
        };
      })
      .sort((a, b) => (a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1));
    options.push({ label: t("Custom"), value: "custom" });
    return options;
  }, [bellSchedules, t, period.locationId, period.locationGroupId]);

  const getPeriods = useQueryBundle(GetBellSchedulePeriods, {
    variables: {
      id: period.bellScheduleId,
    },
    skip: !period.bellScheduleId || period.bellScheduleId === "custom",
  });
  const periods =
    getPeriods.state != "LOADING"
      ? getPeriods.data.workDaySchedule?.byId?.periods ?? []
      : [];
  const periodStartOptions: OptionType[] = useMemo(
    () =>
      periods
        .sort((a, b) =>
          b?.standardPeriod?.startTime < a?.standardPeriod?.startTime ? 1 : -1
        )
        .map(p => ({
          label: `${p?.name} (${secondsToFormattedHourMinuteString(
            p?.standardPeriod?.startTime
          )})`,
          value: p?.id ?? "",
        })),
    [periods]
  );

  const periodEndOptions: OptionType[] = useMemo(
    () =>
      periods
        .sort((a, b) =>
          b?.standardPeriod?.endTime < a?.standardPeriod?.endTime ? 1 : -1
        )
        .map(p => ({
          label: `${p?.name} (${secondsToFormattedHourMinuteString(
            p?.standardPeriod?.endTime
          )})`,
          value: p?.id ?? "",
        })),
    [periods]
  );

  const startPeriodSelected = useMemo(
    () =>
      period.bellScheduleId && period.bellScheduleId !== "custom"
        ? {
            value: period.startPeriodId ?? "",
            label:
              periodStartOptions.find(
                e => e.value && e.value === period.startPeriodId
              )?.label || "",
          }
        : { value: "", label: "" },
    [period.bellScheduleId, periodStartOptions, period.startPeriodId]
  );

  const endPeriodSelected = useMemo(
    () =>
      period.bellScheduleId && period.bellScheduleId !== "custom"
        ? {
            value: period.endPeriodId ?? "",
            label:
              periodEndOptions.find(
                e => e.value && e.value === period.endPeriodId
              )?.label || "",
          }
        : { value: "", label: "" },
    [period.bellScheduleId, periodEndOptions, period.endPeriodId]
  );

  const locationError = GetError(
    props.errors,
    "locationId",
    index,
    props.scheduleIndex
  );
  const bellScheduleError = GetError(
    props.errors,
    "bellScheduleId",
    index,
    props.scheduleIndex
  );
  const startTimeError = GetError(
    props.errors,
    "startTime",
    index,
    props.scheduleIndex
  );
  const endTimeError = GetError(
    props.errors,
    "endTime",
    index,
    props.scheduleIndex
  );
  const timeSpanError = GetError(
    props.errors,
    "timespan",
    index,
    props.scheduleIndex
  );
  const startPeriodIdError = GetError(
    props.errors,
    "startPeriodId",
    index,
    props.scheduleIndex
  );
  const endPeriodIdError = GetError(
    props.errors,
    "endPeriodId",
    index,
    props.scheduleIndex
  );

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Typography>{t("Location")}</Typography>
          <SelectNew
            value={{
              value: period.locationId ?? "",
              label:
                props.locationOptions.find(
                  e => e.value && e.value === period.locationId
                )?.label || "",
            }}
            multiple={false}
            onChange={(value: OptionType) => {
              const id = (value as OptionTypeBase).value.toString();
              props.onChangeLocation(id, index);
            }}
            options={props.locationOptions}
            withResetValue={false}
            inputStatus={locationError ? "error" : "default"}
            validationMessage={locationError}
          />
        </Grid>
        <Grid item xs={6}>
          <Typography>{t("Bell Schedule")}</Typography>
          <SelectNew
            value={{
              value: period.bellScheduleId ?? "",
              label:
                bellScheduleOptions.find(
                  e => e.value && e.value === period.bellScheduleId
                )?.label || "",
            }}
            multiple={false}
            onChange={(value: OptionType) => {
              const id = (value as OptionTypeBase).value.toString();
              props.onChangeBellSchedule(id, index);
            }}
            options={bellScheduleOptions}
            withResetValue={false}
            inputStatus={bellScheduleError ? "error" : "default"}
            validationMessage={bellScheduleError}
            doSort={false}
          />
        </Grid>

        {period.bellScheduleId === "custom" ? (
          <Grid container spacing={2} alignItems="center">
            <FormikTimespanInput
              index={props.index}
              scheduleIndex={props.scheduleIndex}
              permitReversedTimes={true}
              startTimeName={`schedules[${props.scheduleIndex}].periods[${props.index}].startTime`}
              endTimeName={`schedules[${props.scheduleIndex}]periods[${props.index}].endTime`}
              period={period}
              inputStatus={timeSpanError ? "error" : "default"}
              validationMessage={timeSpanError}
              errors={props.errors}
            />
          </Grid>
        ) : (
          <Grid container item xs={6} spacing={2} alignItems="center">
            <Grid item xs={6}>
              <Typography>{t("Starting")}</Typography>
              <SelectNew
                value={startPeriodSelected}
                multiple={false}
                onChange={(value: OptionType) => {
                  const id = (value as OptionTypeBase).value.toString();
                  props.onChangeStartPeriod(id, index);
                }}
                options={periodStartOptions}
                withResetValue={false}
                disabled={!period.bellScheduleId || period.allDay}
                inputStatus={startPeriodIdError ? "error" : "default"}
                validationMessage={startPeriodIdError}
                doSort={false}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography>{t("Ending")}</Typography>
              <SelectNew
                value={endPeriodSelected}
                multiple={false}
                onChange={(value: OptionType) => {
                  const id = (value as OptionTypeBase).value.toString();
                  props.onChangeEndPeriod(id, index);
                }}
                options={periodEndOptions}
                withResetValue={false}
                disabled={!period.bellScheduleId || period.allDay}
                inputStatus={endPeriodIdError ? "error" : "default"}
                validationMessage={endPeriodIdError}
                doSort={false}
              />
            </Grid>
          </Grid>
        )}

        {period.bellScheduleId !== "custom" && (
          <Grid item>
            <FormControlLabel
              control={
                <Checkbox
                  color="primary"
                  checked={period.allDay}
                  onChange={e => props.onCheckAllDay(!period.allDay)}
                  disabled={props.disableAllDay}
                />
              }
              label={t("All Day")}
            />
          </Grid>
        )}
        <Grid container item xs={12} spacing={2}>
          {props.index != 0 && (
            <Grid item>
              <TextButton
                className={classes.redLink}
                onClick={() => props.onRemoveSchool(props.index)}
              >
                {t("Remove school")}
              </TextButton>
            </Grid>
          )}
          {props.lastPeriod && (
            <Grid item>
              <TextButton color="primary" onClick={() => props.onAddSchool()}>
                {`${t("Add another School to schedule")}${
                  props.scheduleNumber
                }`}
              </TextButton>
            </Grid>
          )}
        </Grid>
      </Grid>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  shadedContainer: {
    backgroundColor: "#F5F5F5",
    marginLeft: theme.spacing(1),
  },
  redLink: {
    color: theme.customColors.darkRed,
    textDecoration: "underline",
  },
  headingText: {
    fontSize: theme.typography.pxToRem(16),
    fontStyle: "bold",
  },
}));
