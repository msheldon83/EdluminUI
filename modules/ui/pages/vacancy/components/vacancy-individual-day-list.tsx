import * as React from "react";
import {
  VacancyDetailInput,
  WorkDayScheduleVariant,
} from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { VacancyIndividualDay } from "./vacancy-individual-day";
import { useQueryBundle } from "graphql/hooks";
import { GetVacancyReasonsForOrg } from "../graphql/get-all-vacancy-reasons.gen";
import { compact } from "lodash-es";
import { Checkbox, FormControlLabel, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { isSameDay, format } from "date-fns";
import {
  midnightTime,
  secondsSinceMidnight,
  timeStampToIso,
} from "helpers/time";
import { parseISO } from "date-fns/esm";

type Props = {
  vacancyDays: VacancyDetailInput[];
  workDayScheduleVariant?: WorkDayScheduleVariant | null;
  setFieldValue: (
    field: any,
    value: any,
    shouldValidate?: boolean | undefined
  ) => void;
  updateModel: (p: any) => void;
  orgId: string;
};

export const VacancyIndividualDayList: React.FC<Props> = props => {
  const {
    vacancyDays,
    setFieldValue,
    updateModel,
    orgId,
    workDayScheduleVariant,
  } = props;
  const { t } = useTranslation();
  const [dayForCopy, setDayForCopy] = useState();
  const [useSameTime, setUseSameTime] = useState(false);
  const [useSameReason, setUseSameReason] = useState(false);

  const getvacancyReasons = useQueryBundle(GetVacancyReasonsForOrg, {
    variables: { orgId: orgId },
  });

  const handelSetDayVacReasonValue = React.useCallback(
    (vacDetail: VacancyDetailInput) => {
      const newVacancyDays = vacancyDays.slice();
      newVacancyDays.forEach((vd, i) => {
        if (useSameReason) {
          newVacancyDays[i].vacancyReasonId = vacDetail.vacancyReasonId;
        } else {
          if (isSameDay(vd.date, vacDetail.date)) {
            newVacancyDays[i].vacancyReasonId = vacDetail.vacancyReasonId;
          }
        }
      });
      setFieldValue("details", newVacancyDays);
      updateModel({ details: newVacancyDays });
    },
    [vacancyDays, props.vacancyDays, useSameReason]
  );

  const handelSetDayTimesValue = React.useCallback(
    (vacDetail: VacancyDetailInput) => {
      const newVacancyDays = vacancyDays.slice();
      newVacancyDays.forEach((vd, i) => {
        if (useSameTime) {
          newVacancyDays[i].startTime = vacDetail.startTime;
          newVacancyDays[i].endTime = vacDetail.endTime;
        } else {
          if (isSameDay(vd.date, vacDetail.date)) {
            newVacancyDays[i].startTime = vacDetail.startTime;
            newVacancyDays[i].endTime = vacDetail.endTime;
          }
        }
      });
      setFieldValue("details", newVacancyDays);
      updateModel({ details: newVacancyDays });
    },
    [vacancyDays, props.vacancyDays, useSameTime]
  );

  const handleSameForAllVacReasonCheck = React.useCallback(
    (value: boolean) => {
      if (value) {
        const newVacancyDays = vacancyDays.slice();
        const vacReasonId = newVacancyDays[0].vacancyReasonId;
        newVacancyDays.forEach(vd => {
          vd.vacancyReasonId = vacReasonId;
        });
        setFieldValue("details", newVacancyDays);
        updateModel({ details: newVacancyDays });
      }
      setUseSameReason(value);
    },
    [vacancyDays, props.vacancyDays]
  );

  const handleSameForAllVTimeCheck = React.useCallback(
    (value: boolean) => {
      if (value) {
        const newVacancyDays = vacancyDays.slice();
        const sTime = newVacancyDays[0].startTime;
        const eTime = newVacancyDays[0].endTime;
        newVacancyDays.forEach(vd => {
          vd.startTime = sTime;
          vd.endTime = eTime;
        });
        setFieldValue("details", newVacancyDays);
        updateModel({ details: newVacancyDays });
      }
      setUseSameTime(value);
    },
    [vacancyDays, props.vacancyDays]
  );

  const vacancyReasons: any =
    getvacancyReasons.state === "LOADING"
      ? []
      : compact(getvacancyReasons?.data?.orgRef_VacancyReason?.all ?? []);

  const vacancyReasonOptions = useMemo(() => {
    return getvacancyReasons.state === "LOADING"
      ? []
      : vacancyReasons.map((r: any) => ({ label: r.name, value: r.id }));
  }, [vacancyReasons, getvacancyReasons]);

  const dayParts = useMemo(() => {
    const partsArray = [];
    partsArray.push({
      id: "full",
      label: `Full day (${format(
        parseISO(
          timeStampToIso(
            midnightTime().setSeconds(workDayScheduleVariant?.startTime)
          )
        ),
        "h:mm a"
      )}-${format(
        parseISO(
          timeStampToIso(
            midnightTime().setSeconds(workDayScheduleVariant?.endTime)
          )
        ),
        "h:mm a"
      )})`,
      start: workDayScheduleVariant?.startTime,
      end: workDayScheduleVariant?.endTime,
    });
    partsArray.push({
      id: "halfDayAM",
      label: `Half day AM (${format(
        parseISO(
          timeStampToIso(
            midnightTime().setSeconds(workDayScheduleVariant?.startTime)
          )
        ),
        "h:mm a"
      )}-${format(
        parseISO(
          timeStampToIso(
            midnightTime().setSeconds(workDayScheduleVariant?.halfDayMorningEnd)
          )
        ),
        "h:mm a"
      )})`,
      start: workDayScheduleVariant?.startTime,
      end: workDayScheduleVariant?.halfDayMorningEnd,
    });
    partsArray.push({
      id: "halfDayPM",
      label: `Half day PM (${format(
        parseISO(
          timeStampToIso(
            midnightTime().setSeconds(
              workDayScheduleVariant?.halfDayAfternoonStart
            )
          )
        ),
        "h:mm a"
      )}-${format(
        parseISO(
          timeStampToIso(
            midnightTime().setSeconds(workDayScheduleVariant?.endTime)
          )
        ),
        "h:mm a"
      )})`,
      start: workDayScheduleVariant?.halfDayAfternoonStart,
      end: workDayScheduleVariant?.endTime,
    });
    partsArray.push({
      id: "custom",
      label: "Custom times",
      start: 0,
      end: 0,
    });

    return partsArray;
  }, [props, workDayScheduleVariant]);

  /* this effect is needed when we add a day and the check box is selected to use same reason */
  /* we want to default the newly added day to the first vac reason*/
  useEffect(() => {
    if (vacancyDays.length > 0) {
      let update = false;
      const vacReasonId =
        vacancyDays[0].vacancyReasonId ?? vacancyReasonOptions[0].value;
      for (let i = 0; i < vacancyDays.length; i++) {
        if (useSameReason && vacancyDays[i].vacancyReasonId !== vacReasonId) {
          vacancyDays[i].vacancyReasonId = vacReasonId;
          update = true;
        } else {
          if (!vacancyDays[i].vacancyReasonId) {
            vacancyDays[i].vacancyReasonId = vacReasonId;
            update = true;
          }
        }
      }
      if (update) {
        setFieldValue("details", vacancyDays);
        updateModel({ details: vacancyDays });
      }
    }
  }, [vacancyDays, props, useSameReason]);

  /* this effect is needed when we add a day and the check box is selected to use same times */
  /* we want to default the newly added day to the first start and end times*/
  useEffect(() => {
    if (vacancyDays.length > 0) {
      const sTime = vacancyDays[0].startTime ?? dayParts[0].start;
      const eTime = vacancyDays[0].endTime ?? dayParts[0].end;
      let update = false;
      for (let i = 0; i < vacancyDays.length; i++) {
        if (
          useSameTime &&
          vacancyDays[i].startTime !== sTime &&
          vacancyDays[i].endTime !== eTime
        ) {
          vacancyDays[i].startTime = sTime;
          vacancyDays[i].endTime = eTime;
          update = true;
        } else {
          if (!vacancyDays[i].startTime || !vacancyDays[i].endTime) {
            vacancyDays[i].startTime = sTime;
            vacancyDays[i].endTime = eTime;
            update = true;
          }
        }
      }
      if (update) {
        setFieldValue("details", vacancyDays);
        updateModel({ details: vacancyDays });
      }
    }
  }, [vacancyDays, props, useSameTime]);

  if (getvacancyReasons.state === "LOADING") {
    return <></>;
  }

  if (vacancyDays.length === 0) {
    return <></>;
  }

  return (
    <>
      <Grid container justify="space-between">
        {vacancyDays.map((d, i) => {
          return (
            <div key={"vacancy-day-" + i}>
              <Grid item xs={12}>
                <VacancyIndividualDay
                  vacancyDetail={d}
                  vacancyReasonOptions={vacancyReasonOptions}
                  dayParts={dayParts}
                  setVacancyDetailReason={handelSetDayVacReasonValue}
                  setVacancyDetailTimes={handelSetDayTimesValue}
                  showCopyPast={vacancyDays.length > 1}
                />
              </Grid>
              {i === 0 && vacancyDays.length > 1 && (
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={useSameTime}
                        onChange={e => {
                          const isChecked = e.target.checked;
                          handleSameForAllVTimeCheck(isChecked);
                        }}
                      />
                    }
                    label={t("Same time for all days")}
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        color="primary"
                        checked={useSameReason}
                        onChange={e => {
                          const isChecked = e.target.checked;
                          handleSameForAllVacReasonCheck(isChecked);
                        }}
                      />
                    }
                    label={t("Same reason for all days")}
                  />
                </Grid>
              )}
            </div>
          );
        })}
      </Grid>
    </>
  );
};
