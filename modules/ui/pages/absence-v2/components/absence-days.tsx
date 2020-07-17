import * as React from "react";
import { useTranslation } from "react-i18next";
import { AbsenceDetail } from "../types";
import { useFormikContext } from "formik";
import { useAbsenceReasonOptionsWithCategories } from "reference-data/absence-reasons";
import { format } from "date-fns";
import { FormControlLabel, Checkbox, makeStyles } from "@material-ui/core";
import { DayPart } from "graphql/server-types.gen";
import { AbsenceDay } from "./absence-day";

type Props = {
  details: AbsenceDetail[];
  organizationId: string;
  employeeId: string;
  positionTypeId?: string;
  onTimeChange: () => void;
};

export const AbsenceDays: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const { errors, setFieldValue } = useFormikContext<any>();
  const { organizationId, employeeId, positionTypeId, onTimeChange, details = [] } = props;

  const absenceReasonOptions = useAbsenceReasonOptionsWithCategories(
    organizationId,
    [],
    positionTypeId
  );

  const [sameReason, setSameReason] = React.useState(
    detailsHaveTheSameReasons(details)
  );
  const [sameTimes, setSameTimes] = React.useState(
    detailsHaveTheSameTimes(details)
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

  const allDetailsAreTheSame = React.useMemo(() => sameReason && sameTimes, [
    sameReason,
    sameTimes,
  ]);

  return (
    <>
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
              detail={ad}
              absenceReasonOptions={absenceReasonOptions}
              showReason={i === 0 || !sameReason}
              showDayPart={i === 0 || !sameTimes}
              subTitle={
                details.length > 1 && !allDetailsAreTheSame
                  ? format(ad.date, "EEE, MMM d")
                  : details.length > 1 && allDetailsAreTheSame && i === 0
                  ? t("Details for all days")
                  : undefined
              }
              onReasonChange={absenceReasonId => {
                if (i === 0 && sameReason && details.length > 1) {
                  // Apply the same reason to all details
                  for (let index = 0; index < details.length; index++) {
                    setFieldValue(
                      `details[${index}].absenceReasonId`,
                      absenceReasonId
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
                if (i === 0 && sameTimes && details.length > 1) {
                  // Apply the same times to all details
                  for (let index = 0; index < details.length; index++) {
                    setFieldValue(`details[${index}].dayPart`, dayPart);
                    if (dayPart === DayPart.Hourly) {
                      setFieldValue(
                        `details[${index}].hourlyStartTime`,
                        hourlyStartTime
                      );
                      setFieldValue(
                        `details[${index}].hourlyEndTime`,
                        hourlyEndTime
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
            {i === 0 && details.length > 1 && (
              <div className={classes.sameOptions}>
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={sameReason}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setSameReason(isChecked);
                        if (isChecked) {
                          setAllReasonsTheSame();
                        }
                      }}
                    />
                  }
                  label={t("Same reason for all days")}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      color="primary"
                      checked={sameTimes}
                      onChange={e => {
                        const isChecked = e.target.checked;
                        setSameTimes(isChecked);
                        if (isChecked) {
                          setAllTimesTheSame();
                        }
                      }}
                    />
                  }
                  label={t("Same time for all days")}
                />
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

const detailsHaveTheSameReasons = (details: AbsenceDetail[]) => {
  if (!details || details.length === 0) {
    return true;
  }

  const absenceReasonIdToCompare = details[0].absenceReasonId;
  for (let index = 0; index < details.length; index++) {
    const absenceReasonId = details[index].absenceReasonId;
    if (!absenceReasonId && !absenceReasonIdToCompare) {
      continue;
    }

    if (absenceReasonId !== absenceReasonIdToCompare) {
      return false;
    }
  }

  return true;
};

const detailsHaveTheSameTimes = (details: AbsenceDetail[]) => {
  if (!details || details.length === 0) {
    return true;
  }

  const timesToCompare = {
    dayPart: details[0].dayPart,
    hourlyStartTime: details[0].hourlyStartTime,
    hourlyEndTime: details[0].hourlyEndTime,
  };
  for (let index = 0; index < details.length; index++) {
    const times = {
      dayPart: details[index].dayPart,
      hourlyStartTime: details[index].hourlyStartTime,
      hourlyEndTime: details[index].hourlyEndTime,
    };
    if (!times?.dayPart && !timesToCompare?.dayPart) {
      continue;
    }

    if (times.dayPart !== timesToCompare.dayPart) {
      return false;
    }

    // If Hourly, check if the start and end are the same
    if (
      times.dayPart === DayPart.Hourly &&
      (times.hourlyStartTime?.toISOString() !==
        timesToCompare.hourlyStartTime?.toISOString() ||
        times.hourlyEndTime?.toISOString() !==
          timesToCompare.hourlyEndTime?.toISOString())
    ) {
      return false;
    }
  }

  return true;
};
