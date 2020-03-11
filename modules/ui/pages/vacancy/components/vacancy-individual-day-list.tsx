import * as React from "react";
import {
  VacancyDetailInput,
  WorkDayScheduleVariant,
  PayCode,
  AccountingCode,
} from "graphql/server-types.gen";
import { useState, useMemo, useEffect } from "react";
import { VacancyIndividualDay } from "./vacancy-individual-day";
import { useQueryBundle } from "graphql/hooks";
import { GetVacancyReasonsForOrg } from "../graphql/get-all-vacancy-reasons.gen";
import { compact } from "lodash-es";
import { Checkbox, FormControlLabel, Grid } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { isSameDay, format } from "date-fns";
import { midnightTime, timeStampToIso } from "helpers/time";
import { parseISO } from "date-fns/esm";

type Props = {
  vacancyDays: VacancyDetailInput[];
  workDayScheduleVariant?: WorkDayScheduleVariant | null;
  payCodes: PayCode[];
  accountingCodes: AccountingCode[];
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
    payCodes,
    accountingCodes,
  } = props;
  const { t } = useTranslation();
  const [dayForCopy, setDayForCopy] = useState();
  const [useSameTime, setUseSameTime] = useState();
  const [useSameReason, setUseSameReason] = useState();
  const [useSamePayCode, setUseSamePayCode] = useState(true);
  const [useSameAccountingCode, setUseSameAccountingCode] = useState(true);

  const getvacancyReasons = useQueryBundle(GetVacancyReasonsForOrg, {
    variables: { orgId: orgId },
  });

  const allCheckMarksChecked = useMemo(() => {
    return (
      useSameTime && useSameReason && useSamePayCode && useSameAccountingCode
    );
  }, [useSameTime, useSameReason, useSamePayCode, useSameAccountingCode]);

  const handelSetDayVacReasonValue = React.useCallback(
    (vacDetail: VacancyDetailInput) => {
      const newVacancyDays = vacancyDays.slice();
      newVacancyDays.forEach((vd, i) => {
        newVacancyDays[i] = {
          //need this to mark form as dirty
          ...newVacancyDays[i],
        };
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
        newVacancyDays[i] = {
          //need this to mark form as dirty
          ...newVacancyDays[i],
        };
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

  const handleSetPayCodeValue = React.useCallback(
    (vacDetail: VacancyDetailInput) => {
      const newVacancyDays = vacancyDays.slice();
      newVacancyDays.forEach((vd, i) => {
        newVacancyDays[i] = {
          //need this to mark form as dirty
          ...newVacancyDays[i],
        };
        if (useSamePayCode) {
          newVacancyDays[i].payCodeId = vacDetail.payCodeId;
        } else {
          if (isSameDay(vd.date, vacDetail.date)) {
            newVacancyDays[i].payCodeId = vacDetail.payCodeId;
          }
        }
      });
      setFieldValue("details", newVacancyDays);
      updateModel({ details: newVacancyDays });
    },
    [vacancyDays, props.vacancyDays, useSamePayCode]
  );

  const handleSetAccountingCodeValue = React.useCallback(
    (vacDetail: VacancyDetailInput) => {
      const newVacancyDays = vacancyDays.slice();
      const accCode =
        vacDetail.accountingCodeAllocations &&
        vacDetail.accountingCodeAllocations.length > 0
          ? vacDetail.accountingCodeAllocations[0]
          : {
              accountingCodeId: accountingCodeOptions[0].value,
              allocation: 1.0,
            };
      newVacancyDays.forEach((vd, i) => {
        newVacancyDays[i] = {
          //need this to mark form as dirty
          ...newVacancyDays[i],
        };
        if (useSameAccountingCode) {
          newVacancyDays[i].accountingCodeAllocations = [accCode];
        } else {
          if (isSameDay(vd.date, vacDetail.date)) {
            newVacancyDays[i].accountingCodeAllocations = [accCode];
          }
        }
      });
      setFieldValue("details", newVacancyDays);
      updateModel({ details: newVacancyDays });
    },
    [vacancyDays, props.vacancyDays, useSameAccountingCode]
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

  const handleSameForAllPayCodeCheck = React.useCallback(
    (value: boolean) => {
      if (value) {
        const newVacancyDays = vacancyDays.slice();
        const payCodeId = newVacancyDays[0].payCodeId;
        newVacancyDays.forEach(vd => {
          vd.payCodeId = payCodeId;
        });
        setFieldValue("details", newVacancyDays);
        updateModel({ details: newVacancyDays });
      }
      setUseSamePayCode(value);
    },
    [vacancyDays, props.vacancyDays]
  );

  const handleSameForAllAccountingCodeCheck = React.useCallback(
    (value: boolean) => {
      if (value) {
        const newVacancyDays = vacancyDays.slice();
        const accCode =
          newVacancyDays[0].accountingCodeAllocations &&
          newVacancyDays[0].accountingCodeAllocations.length > 0
            ? newVacancyDays[0].accountingCodeAllocations[0]
            : {
                accountingCodeId: accountingCodeOptions[0].value,
                allocation: 1.0,
              };
        newVacancyDays.forEach(vd => {
          vd.accountingCodeAllocations = [accCode];
        });
        setFieldValue("details", newVacancyDays);
        updateModel({ details: newVacancyDays });
      }
      setUseSameAccountingCode(value);
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

  const payCodeOptions = useMemo(() => {
    return payCodes.map((r: any) => ({ label: r.name, value: r.id }));
  }, [payCodes, props]);

  const accountingCodeOptions = useMemo(() => {
    return accountingCodes.map((r: any) => ({ label: r.name, value: r.id }));
  }, [accountingCodes, props]);

  const dayParts = useMemo(() => {
    const partsArray: any = [];
    if (!workDayScheduleVariant) return partsArray;
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
      start: workDayScheduleVariant?.startTime,
      end: workDayScheduleVariant?.endTime,
    });

    return partsArray;
  }, [props, workDayScheduleVariant]);

  /* Use this effect for existing vacancies that will have existing days */
  useEffect(() => {
    if (vacancyDays.length > 0) {
      /* vacancy reason */
      const reasonId = vacancyDays[0].vacancyReasonId;
      let useSR = true;
      vacancyDays.forEach(vd => {
        if (vd.vacancyReasonId !== reasonId) {
          useSR = false;
        }
      });
      setUseSameReason(useSR);

      /* times */
      const sTime = vacancyDays[0].startTime;
      const eTime = vacancyDays[0].endTime;
      let useSt = true;
      vacancyDays.forEach(vd => {
        if (vd.startTime !== sTime || vd.endTime !== eTime) {
          useSt = false;
        }
      });
      setUseSameTime(useSt);

      /* paycodes */
      const payCodeId = vacancyDays[0].payCodeId;
      let useSPC = true;
      vacancyDays.forEach(vd => {
        if (vd.payCodeId !== payCodeId) {
          useSPC = false;
        }
      });
      setUseSamePayCode(useSPC);

      /* accounting code */
      const accountingCodeId = vacancyDays[0].accountingCodeAllocations
        ? vacancyDays[0].accountingCodeAllocations[0]?.accountingCodeId
        : "";
      let useSAC = true;
      vacancyDays.forEach(vd => {
        if (
          vd.accountingCodeAllocations &&
          vd.accountingCodeAllocations[0]?.accountingCodeId !== accountingCodeId
        ) {
          useSAC = false;
        }
      });
      setUseSameAccountingCode(useSAC);
    } else {
      setUseSameReason(true);
      setUseSameTime(true);
      setUseSamePayCode(true);
      setUseSameAccountingCode(true);
    }
  }, []);

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
            vacancyDays[i].vacancyReasonId = vacancyReasonOptions[0].value;
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
            vacancyDays[i].startTime = dayParts[0].start;
            vacancyDays[i].endTime = dayParts[0].end;
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

  /* this effect is needed when we add a day and the check box is selected to use same paycodes */
  /* we want to default the newly added day to the first paycode*/
  useEffect(() => {
    if (vacancyDays.length > 0) {
      let update = false;
      const payCodeId = vacancyDays[0].payCodeId ?? payCodeOptions[0].value;
      for (let i = 0; i < vacancyDays.length; i++) {
        if (useSamePayCode && vacancyDays[i].payCodeId !== payCodeId) {
          vacancyDays[i].payCodeId = payCodeId;
          update = true;
        } else {
          if (!vacancyDays[i].payCodeId) {
            vacancyDays[i].payCodeId = payCodeOptions[0].value;
            update = true;
          }
        }
      }
      if (update) {
        setFieldValue("details", vacancyDays);
        updateModel({ details: vacancyDays });
      }
    }
  }, [vacancyDays, props, useSamePayCode]);

  /* this effect is needed when we add a day and the check box is selected to use same accountingcode */
  /* we want to default the newly added day to the first accounting code*/
  useEffect(() => {
    if (vacancyDays.length > 0) {
      let update = false;
      const accountingCodeId =
        vacancyDays[0].accountingCodeAllocations &&
        vacancyDays[0].accountingCodeAllocations.length > 0
          ? vacancyDays[0].accountingCodeAllocations[0]?.accountingCodeId
          : accountingCodeOptions[0].value;
      for (let i = 0; i < vacancyDays.length; i++) {
        if (
          useSameAccountingCode &&
          vacancyDays[i].accountingCodeAllocations &&
          !vacancyDays[i].accountingCodeAllocations?.find(
            a => a?.accountingCodeId === accountingCodeId
          )
        ) {
          vacancyDays[i].accountingCodeAllocations = [
            { accountingCodeId: accountingCodeId, allocation: 1.0 },
          ];
          update = true;
        } else {
          if (!vacancyDays[i].accountingCodeAllocations) {
            vacancyDays[i].accountingCodeAllocations = [
              {
                accountingCodeId: accountingCodeOptions[0].value,
                allocation: 1.0,
              },
            ];
            update = true;
          }
        }
      }
      if (update) {
        setFieldValue("details", vacancyDays);
        updateModel({ details: vacancyDays });
      }
    }
  }, [vacancyDays, props, useSameAccountingCode]);

  if (getvacancyReasons.state === "LOADING") {
    return <></>;
  }

  if (vacancyDays.length === 0) {
    return <></>;
  }
  return (
    <>
      <Grid container justify="space-between">
        <Grid item container xs={12}>
          <VacancyIndividualDay
            vacancyDetail={vacancyDays[0]}
            vacancyReasonOptions={vacancyReasonOptions}
            payCodeOptions={payCodeOptions}
            accountingCodeOptions={accountingCodeOptions}
            dayParts={dayParts}
            setVacancyDetailReason={handelSetDayVacReasonValue}
            setVacancyDetailTimes={handelSetDayTimesValue}
            setVacancyPayCode={handleSetPayCodeValue}
            setVacancyAccountingCode={handleSetAccountingCodeValue}
            showCopyPast={false}
            subTitle={
              allCheckMarksChecked && vacancyDays.length > 1
                ? t("Vacancy Details for all days")
                : undefined
            }
          />
        </Grid>
        {vacancyDays.length > 1 && (
          <Grid item container xs={12}>
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
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={useSamePayCode}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      handleSameForAllPayCodeCheck(isChecked);
                    }}
                  />
                }
                label={t("Same paycode for all days")}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={useSameAccountingCode}
                    onChange={e => {
                      const isChecked = e.target.checked;
                      handleSameForAllAccountingCodeCheck(isChecked);
                    }}
                  />
                }
                label={t("Same accounting code for all days")}
              />
            </Grid>
          </Grid>
        )}

        {!allCheckMarksChecked &&
          vacancyDays.map((d, i) => {
            return i == 0 ? (
              ""
            ) : (
              <Grid item container xs={12} key={"vacancy-day-" + i}>
                <VacancyIndividualDay
                  vacancyDetail={d}
                  vacancyReasonOptions={vacancyReasonOptions}
                  payCodeOptions={payCodeOptions}
                  accountingCodeOptions={accountingCodeOptions}
                  dayParts={dayParts}
                  setVacancyDetailReason={handelSetDayVacReasonValue}
                  setVacancyDetailTimes={handelSetDayTimesValue}
                  setVacancyPayCode={handleSetPayCodeValue}
                  setVacancyAccountingCode={handleSetAccountingCodeValue}
                  showCopyPast={false}
                />
              </Grid>
            );
          })}
      </Grid>
    </>
  );
};
