import * as React from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetail } from "../types";
import { useFormikContext } from "formik";
import { useAbsenceReasonOptionsWithCategories } from "reference-data/absence-reasons";
import { format, isSameDay } from "date-fns";
import {
  FormControlLabel,
  Checkbox,
  makeStyles,
  Divider,
} from "@material-ui/core";
import { DayPart } from "graphql/server-types.gen";
import { AbsenceDay } from "./absence-day";
import { Select } from "ui/components/form/select";
import { ScheduleTimes } from "helpers/absence/use-employee-schedule-times";
import { uniq, groupBy } from "lodash-es";
import { getAllScheduleTimeDayPartRanges } from "../helpers";
import { DayPartTimesVary } from "./day-part-select";

type Props = {
  details: AbsenceDetail[];
  organizationId: string;
  employeeId: string;
  travellingEmployee: boolean;
  positionTypeId?: string;
  onTimeChange: () => void;
  canEditReason: boolean;
  sameReasonForAllDetails: boolean;
  canEditTimes: boolean;
  sameTimesForAllDetails: boolean;
  deletedAbsenceReasons?: { detailId: string; id: string; name: string }[];
  isQuickCreate?: boolean;
  scheduleTimes: ScheduleTimes[];
};

export const AbsenceDays: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { errors, setFieldValue } = useFormikContext<any>();
  const {
    organizationId,
    employeeId,
    positionTypeId,
    onTimeChange,
    canEditReason,
    sameReasonForAllDetails,
    canEditTimes,
    sameTimesForAllDetails,
    travellingEmployee,
    isQuickCreate,
    scheduleTimes,
    details = [],
    deletedAbsenceReasons = [],
  } = props;

  const absenceReasonOptions = useAbsenceReasonOptionsWithCategories(
    organizationId,
    undefined,
    positionTypeId
  );

  const setAllReasonsTheSame = React.useCallback(() => {
    const firstReason = details[0]?.absenceReasonId;
    setFieldValue(
      "details",
      details.map(d => {
        return {
          ...d,
          absenceReasonId: firstReason,
        };
      })
    );
  }, [details, setFieldValue]);

  const setAllTimesTheSame = React.useCallback(() => {
    const firstDayPart = details[0]?.dayPart;
    const firstHourlyStartTime = details[0]?.hourlyStartTime;
    const firstHourlyEndTime = details[0]?.hourlyEndTime;
    setFieldValue(
      "details",
      details.map(d => {
        return {
          ...d,
          dayPart: firstDayPart,
          hourlyStartTime: firstHourlyStartTime,
          hourlyEndTime: firstHourlyEndTime,
        };
      })
    );
  }, [details, setFieldValue]);

  const allDetailsAreTheSame = React.useMemo(
    () => sameReasonForAllDetails && sameTimesForAllDetails,
    [sameReasonForAllDetails, sameTimesForAllDetails]
  );

  const getAbsenceReasonOptions = React.useCallback(
    (detailId: string | undefined) => {
      if (!detailId) {
        return absenceReasonOptions;
      }

      // Look for a match in the list of deleted Reasons
      const deletedReason = deletedAbsenceReasons.find(
        d => d.detailId === detailId
      );
      if (!deletedReason) {
        // No match, return normal list
        return absenceReasonOptions;
      }

      return [
        ...absenceReasonOptions,
        { label: deletedReason.name, value: deletedReason.id },
      ];
    },
    [absenceReasonOptions, deletedAbsenceReasons]
  );

  const dayPartTimesVary: DayPartTimesVary[] = React.useMemo(() => {
    if (!sameTimesForAllDetails || details.length === 0) {
      return [];
    }

    // Figure out what the time ranges for each day are across the different
    // possible Day Parts and if we have more than one unique set of time ranges
    // for a certain Day Part, that means those times vary across the dates selected
    const scheduleTimeDayPartRanges = getAllScheduleTimeDayPartRanges(
      scheduleTimes.filter(s => !!details.find(d => isSameDay(s.date, d.date)))
    );

    const dayPartTimesVary: DayPartTimesVary[] = [];
    Object.entries(groupBy(scheduleTimeDayPartRanges, s => s.dayPart)).forEach(
      ([dayPart, details]) => {
        const uniqueTimeRanges = uniq(
          details.map(d => `${d.startTime}|${d.endTime}`)
        );
        dayPartTimesVary.push({
          dayPart: details[0].dayPart,
          timesVary: uniqueTimeRanges.length > 1,
        });
      }
    );

    return dayPartTimesVary;
  }, [details, sameTimesForAllDetails, scheduleTimes]);

  return (
    <>
      {details.length === 0 && (
        <div>
          <div className={classes.placeholderSelectionSpacing}>
            {t("Please select one or more dates above")}
          </div>
          <div className={classes.placeholderSelectionSpacing}>
            <Select
              label={t("Reason")}
              value={undefined}
              multiple={false}
              disabled={true}
              options={[]}
            />
          </div>
          <div className={classes.placeholderSelectionSpacing}>
            <Select
              label={t("Times")}
              value={undefined}
              multiple={false}
              disabled={true}
              options={[]}
            />
          </div>
        </div>
      )}
      {details.map((ad, i) => {
        if (allDetailsAreTheSame && i > 0) {
          return <React.Fragment key={ad.id ?? format(ad.date, "P")} />;
        }

        const reasonError = getErrorMessage(errors, "absenceReasonId", i);
        const dayPartError = getErrorMessage(errors, "dayPart", i);
        const hourlyStartTimeError = getErrorMessage(
          errors,
          "hourlyStartTime",
          i
        );
        const hourlyEndTimeError = getErrorMessage(errors, "hourlyEndTime", i);

        return (
          <React.Fragment key={ad.id ?? format(ad.date, "P")}>
            <AbsenceDay
              organizationId={organizationId}
              employeeId={employeeId}
              travellingEmployee={travellingEmployee}
              detail={ad}
              scheduleTimes={scheduleTimes.find(s =>
                isSameDay(ad.date, s.date)
              )}
              absenceReasonOptions={getAbsenceReasonOptions(ad.id)}
              dayPartTimesVary={dayPartTimesVary}
              canEditReason={canEditReason}
              canEditTimes={canEditTimes}
              showReason={i === 0 || !sameReasonForAllDetails}
              showDayPart={i === 0 || !sameTimesForAllDetails}
              subTitle={
                details.length > 1 && !allDetailsAreTheSame && !isQuickCreate
                  ? format(ad.date, "EEE, MMM d")
                  : details.length > 1 &&
                    allDetailsAreTheSame &&
                    i === 0 &&
                    !isQuickCreate
                  ? t("Details for all days")
                  : undefined
              }
              onReasonChange={absenceReasonId => {
                if (i === 0 && sameReasonForAllDetails && details.length > 1) {
                  // Apply the same reason to all details
                  for (let index = 0; index < details.length; index++) {
                    setFieldValue(
                      `details[${index}].absenceReasonId`,
                      absenceReasonId,
                      !!reasonError
                    );
                  }
                } else {
                  setFieldValue(
                    `details[${i}].absenceReasonId`,
                    absenceReasonId,
                    !!reasonError
                  );
                }
              }}
              reasonError={reasonError}
              onTimeChange={(dayPart, hourlyStartTime, hourlyEndTime) => {
                if (i === 0 && sameTimesForAllDetails && details.length > 1) {
                  // Apply the same times to all details
                  for (let index = 0; index < details.length; index++) {
                    setFieldValue(
                      `details[${index}].dayPart`,
                      dayPart,
                      !!dayPartError
                    );
                    if (dayPart === DayPart.Hourly) {
                      setFieldValue(
                        `details[${index}].hourlyStartTime`,
                        hourlyStartTime,
                        !!hourlyStartTimeError
                      );
                      setFieldValue(
                        `details[${index}].hourlyEndTime`,
                        hourlyEndTime,
                        !!hourlyEndTimeError
                      );
                    }
                  }
                } else {
                  setFieldValue(
                    `details[${i}].dayPart`,
                    dayPart,
                    !!dayPartError
                  );
                  if (dayPart === DayPart.Hourly) {
                    setFieldValue(
                      `details[${i}].hourlyStartTime`,
                      hourlyStartTime,
                      !!hourlyStartTimeError
                    );
                    setFieldValue(
                      `details[${i}].hourlyEndTime`,
                      hourlyEndTime,
                      !!hourlyEndTimeError
                    );
                  }
                }
                onTimeChange();
              }}
              timeError={
                dayPartError || hourlyStartTimeError || hourlyEndTimeError
                  ? {
                      dayPartError,
                      hourlyStartTimeError,
                      hourlyEndTimeError,
                    }
                  : undefined
              }
            />
            {i === 0 && details.length > 1 && !isQuickCreate && (
              <div className={classes.sameOptions}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={sameReasonForAllDetails}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setFieldValue("sameReasonForAllDetails", isChecked);
                        if (isChecked) {
                          setAllReasonsTheSame();
                        }
                      }}
                      disabled={!canEditReason}
                    />
                  }
                  label={t("Same reason for all days")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={sameTimesForAllDetails}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setFieldValue("sameTimesForAllDetails", isChecked);
                        if (isChecked) {
                          setAllTimesTheSame();
                        }
                      }}
                      disabled={!canEditTimes}
                    />
                  }
                  label={t("Same time for all days")}
                />
              </div>
            )}
            {!allDetailsAreTheSame && (
              <div className={classes.divider}>
                <Divider />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const useStyles = makeStyles(theme => ({
  sameOptions: {
    display: "flex",
    justifyContent: "space-between",
  },
  placeholderSelectionSpacing: {
    marginTop: theme.spacing(),
  },
  divider: {
    color: theme.customColors.gray,
    marginTop: theme.spacing(3),
  },
}));

const getErrorMessage = (errors: any, fieldName: string, index: number) => {
  if (!errors.details || !errors.details[index]) {
    return undefined;
  }

  const detailError = errors.details[index];
  if (!detailError[fieldName]) {
    return undefined;
  }

  const errorMessage: string = detailError[fieldName];
  return errorMessage;
};
