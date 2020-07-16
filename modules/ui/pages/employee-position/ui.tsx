import * as React from "react";
import { Grid, makeStyles, Typography, Divider } from "@material-ui/core";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Section } from "ui/components/section";
import { SectionHeader } from "ui/components/section-header";
import { useLocations } from "reference-data/locations";
import { useContracts } from "reference-data/contracts";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { ActionButtons } from "ui/components/action-buttons";
import * as yup from "yup";
import { Formik } from "formik";
import {
  PositionInput,
  NeedsReplacement,
  DayOfWeek,
  PositionAccountingCode,
} from "graphql/server-types.gen";
import { OptionTypeBase } from "react-select/src/types";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { PeopleRoute } from "ui/routes/people";
import { useRouteParams } from "ui/routes/definition";
import { GetPositionTypes } from "./graphql/get-positiontypes.gen";
import { GetBellSchedules } from "./graphql/get-bell-schedules.gen";
import { ScheduleUI } from "./components/schedule";
import {
  Schedule,
  buildNewSchedule,
  buildNewPeriod,
} from "./components/helpers";
import { flatMap } from "lodash-es";
import { secondsSinceMidnight } from "helpers/time";
import { isBefore, parseISO } from "date-fns";
import {
  AccountingCodeDropdown,
  noAllocation,
  AccountingCodeValue,
} from "ui/components/form/accounting-code-dropdown";
import {
  mapAccountingCodeAllocationsToAccountingCodeValue,
  mapAccountingCodeValueToAccountingCodeAllocations,
  validateAccountingCodeAllocations,
} from "helpers/accounting-code-allocations";

type Props = {
  position:
    | {
        positionTypeId?: string | null | undefined;
        title?: string | null | undefined;
        needsReplacement?: NeedsReplacement | null | undefined;
        contractId?: string | null | undefined;
        hoursPerFullWorkDay?: number | null | undefined;
      }
    | null
    | undefined;
  accountingCodeAllocations: Pick<
    PositionAccountingCode,
    "accountingCodeId" | "accountingCode" | "allocation"
  >[];
  positionSchedule: Schedule[] | null | undefined;
  onSave: (position: PositionInput) => Promise<unknown>;
  onCancel: () => void;
  submitLabel: string;
  setPositionTypeName?: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
};

export const PositionEditUI: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();
  const params = useRouteParams(PeopleRoute);

  const position = props.position;

  const getPositionTypes = useQueryBundle(GetPositionTypes, {
    fetchPolicy: "cache-first",
    variables: { orgId: params.organizationId },
  });

  const positionTypes = useMemo(() => {
    if (
      getPositionTypes.state === "DONE" &&
      getPositionTypes.data.positionType
    ) {
      return compact(getPositionTypes.data.positionType.all) ?? [];
    }
    return [];
  }, [getPositionTypes]);
  const positionTypeOptions: OptionType[] = useMemo(
    () => positionTypes.map(p => ({ label: p.name, value: p.id })),
    [positionTypes]
  );

  const contracts = useContracts(params.organizationId);
  const contractOptions: OptionType[] = useMemo(
    () => contracts.map(p => ({ label: p.name, value: p.id })),
    [contracts]
  );

  const locations = useLocations(params.organizationId);
  const locationOptions: OptionType[] = useMemo(
    () => locations.map(p => ({ label: p.name, value: p.id })),
    [locations]
  );

  const getScheduledLocationIds = (schedules: Schedule[]) => {
    const scheduledLocationIds: Set<string> = new Set();
    (schedules ?? []).forEach(ps =>
      ps.periods.forEach(p => {
          scheduledLocationIds.add(p.locationId);
      })
    );
    return Array.from(scheduledLocationIds);
  };

  
  const accountingCodes = useAccountingCodes(params.organizationId);
  const getValidAccountingCodes: (
    locationIds: string[]
  ) => OptionType[] = locationIds =>
    accountingCodes
      .filter(
        ac =>
          ac.allLocations || ac.locationIds.find(l => locationIds.includes(l))
      )
      .map(p => ({ label: p.name, value: p.id }));

  const getBellSchedules = useQueryBundle(GetBellSchedules, {
    fetchPolicy: "cache-first",
    variables: { orgId: params.organizationId },
  });
  const bellSchedules =
    getBellSchedules.state != "LOADING"
      ? getBellSchedules.data.workDaySchedule?.all ?? []
      : [];

  const needsReplacementOptions: OptionType[] = useMemo(
    () => [
      { label: t("Yes"), value: NeedsReplacement.Yes },
      { label: t("No"), value: NeedsReplacement.No },
      { label: t("Employee can choose"), value: NeedsReplacement.Sometimes },
    ],
    [t]
  );

  

  return (
    <>
      <Formik
        initialValues={{
          positionTypeId: position?.positionTypeId ?? "",
          title: position?.title ?? "",
          needsReplacement: position?.needsReplacement ?? NeedsReplacement.Yes,
          contractId: position?.contractId ?? "",
          accountingCodeValue: mapAccountingCodeAllocationsToAccountingCodeValue(
            props.accountingCodeAllocations.map(a => {
              return {
                accountingCodeId: a.accountingCodeId,
                accountingCodeName: a.accountingCode?.name,
                allocation: a.allocation,
              };
            })
          ),
          hoursPerFullWorkDay: position?.hoursPerFullWorkDay ?? "",
          schedules: props.positionSchedule ?? [buildNewSchedule(true, true)],
        }}
        onSubmit={async (data, e) => {
          const schedules = data.schedules.map(s => ({
            items: s.periods.map(p => ({
              location: { id: p.locationId },
              bellSchedule:
                p.bellScheduleId != "custom" ? { id: p.bellScheduleId } : null,
              startPeriod:
                !p.startTime && p.startPeriodId
                  ? { id: p.startPeriodId }
                  : null,
              endPeriod:
                !p.endTime && p.endPeriodId ? { id: p.endPeriodId } : null,
              startTime: p.startTime ? secondsSinceMidnight(p.startTime) : null,
              endTime: p.endTime ? secondsSinceMidnight(p.endTime) : null,
            })),
            daysOfTheWeek: s.daysOfTheWeek,
          }));

          await props.onSave({
            positionType: { id: data.positionTypeId },
            title: data.title,
            needsReplacement: data.needsReplacement,
            contract: { id: data.contractId },
            hoursPerFullWorkDay:
              +data.hoursPerFullWorkDay === 0
                ? undefined
                : data.hoursPerFullWorkDay,
            schedules,
            accountingCodeAllocations: mapAccountingCodeValueToAccountingCodeAllocations(
              data.accountingCodeValue
            ),
          });
        }}
        validationSchema={yup
          .object({
            positionTypeId: yup
              .string()
              .nullable()
              .required(t("A position type must be selected")),
            title: yup
              .string()
              .nullable()
              .required(t("A position title is required")),
            needsReplacement: yup
              .string()
              .nullable()
              .required(t("Needs replacement is required")),
            contractId: yup
              .string()
              .nullable()
              .required(t("A contract must be selected")),
            hoursPerFullWorkDay: yup.number().nullable(),
            schedules: yup.array().of(
              yup
                .object()
                .nullable()
                .shape({
                  periods: yup.array().of(
                    yup
                      .object()
                      .shape({
                        locationId: yup
                          .string()
                          .nullable()
                          .required(t("Location is required")),
                        bellScheduleId: yup
                          .string()
                          .nullable()
                          .required(t("Bell schedule is required")),
                        startTime: yup
                          .string()
                          .nullable()
                          .when("bellScheduleId", {
                            is: val => val === "custom",
                            then: yup
                              .string()
                              .nullable()
                              .required(t("Required")),
                          }),
                        endTime: yup
                          .string()
                          .nullable()
                          .when("bellScheduleId", {
                            is: val => val === "custom",
                            then: yup
                              .string()
                              .nullable()
                              .required(t("Required")),
                          }),
                        startPeriodId: yup
                          .string()
                          .nullable()
                          .when("bellScheduleId", {
                            is: val => val !== "custom",
                            then: yup
                              .string()
                              .nullable()
                              .required(t("Required")),
                          }),
                        endPeriodId: yup
                          .string()
                          .nullable()
                          .when("bellScheduleId", {
                            is: val => val !== "custom",
                            then: yup
                              .string()
                              .nullable()
                              .required(t("Required")),
                          }),
                      })
                      .test({
                        name: "overMidnightConfirmed",
                        test: function test(value) { 
                          //allow for reversed time 
                          if (isBefore(parseISO(value.endTime), parseISO(value.startTime))
                          ) {
                            if (!value.overMidnightConfirmed) {
                              //Would really enjoy displaying nothing, but it appears that the mechanism that
                              //restricts submitting the form doesn't work when an empty message is returned.
                              return new yup.ValidationError(t(`Confirmation required`), null, `${this.path}.endTime`);
                            }
                          }
                          return true;
                        },
                      })
                  ),
                })
            ),
          })
          .test({
            name: "accountingCodeAllocationsCheck",
            test: function test(value: {
              accountingCodeValue: AccountingCodeValue;
            }) {
              const accountingCodeAllocations = mapAccountingCodeValueToAccountingCodeAllocations(
                value.accountingCodeValue
              );
              const errorMessage = validateAccountingCodeAllocations(
                accountingCodeAllocations,
                t
              );

              if (errorMessage) {
                return new yup.ValidationError(
                  errorMessage,
                  null,
                  "accountingCodeValue"
                );
              }

              return true;
            },
          })}
      >
        {({
          values,
          handleSubmit,
          submitForm,
          setFieldValue,
          handleBlur,
          errors,
        }) => {
          const validAccountingCodes = getValidAccountingCodes(
            getScheduledLocationIds(values.schedules)
          );
          const accountingCodeAllocations = mapAccountingCodeValueToAccountingCodeAllocations(
            values.accountingCodeValue
          );
          if (
            validAccountingCodes.length > 0 &&
            accountingCodeAllocations.filter(
              a =>
                a.accountingCodeId &&
                !validAccountingCodes.find(v => v.value === a.accountingCodeId)
            ).length > 0
          ) {
            setFieldValue("accountingCodeValue", noAllocation(), false);
          }
          return (
            <form onSubmit={handleSubmit}>
              <Section>
                <SectionHeader title={t("Position")} />
                <Grid container spacing={2}>
                  <Grid item container spacing={2}>
                    <Grid item xs={4}>
                      <Typography>{t("Position Type")}</Typography>
                      <SelectNew
                        key={`positiontype-input`}
                        value={{
                          value: values.positionTypeId,
                          label:
                            positionTypeOptions.find(
                              e => e.value && e.value === values.positionTypeId
                            )?.label || "",
                        }}
                        multiple={false}
                        onChange={(value: OptionType) => {
                          const id = (value as OptionTypeBase).value.toString();
                          const pt = positionTypes.find(x => x.id === id);
                          if (pt?.needsReplacement) {
                            setFieldValue(
                              "needsReplacement",
                              pt.needsReplacement,
                              !!errors?.needsReplacement
                            );
                          }
                          if (pt?.defaultContractId) {
                            setFieldValue(
                              "contractId",
                              pt.defaultContractId,
                              !!errors?.contractId
                            );
                          }
                          if (props.setPositionTypeName) {
                            props.setPositionTypeName(value.label);
                          }
                          setFieldValue(
                            "positionTypeId",
                            id,
                            !!errors?.positionTypeId
                          );
                        }}
                        options={positionTypeOptions}
                        inputStatus={
                          errors.positionTypeId ? "error" : undefined
                        }
                        validationMessage={errors.positionTypeId}
                        withResetValue={false}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>{t("Title")}</Typography>
                      <Input
                        value={values.title}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          placeholder: `E.g Language Arts`,
                          name: "title",
                          id: "title",
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item container spacing={2}>
                    <Grid item xs={values.accountingCodeValue?.type === "multiple-allocations" ? 8 : 4}>
                      <Typography>{t("Needs Replacement")}</Typography>
                      <SelectNew
                        value={needsReplacementOptions.find(
                          e => e.value && e.value === values.needsReplacement
                        )}
                        multiple={false}
                        onChange={(value: OptionType) => {
                          const id = (value as OptionTypeBase).value;
                          setFieldValue(
                            "needsReplacement",
                            id,
                            !!errors?.needsReplacement
                          );
                        }}
                        options={needsReplacementOptions}
                        withResetValue={false}
                      />
                    </Grid>
                    <Grid item xs={values.accountingCodeValue?.type === "multiple-allocations" ? 8 : 4}>
                      <AccountingCodeDropdown
                        value={values.accountingCodeValue}
                        options={validAccountingCodes}
                        onChange={value => {
                          // We only want to validate this field when the form is submitted,
                          // but if we currently have a validation error, then we need to validate
                          // the field until the User fixes the issue and the error is removed
                          setFieldValue(
                            "accountingCodeValue",
                            value,
                            !!errors?.accountingCodeValue
                          );
                        }}
                        inputStatus={
                          errors?.accountingCodeValue ? "error" : undefined
                        }
                        validationMessage={errors?.accountingCodeValue?.toString()}
                      />
                    </Grid>
                  </Grid>
                  <Grid item container spacing={2}>
                    <Grid item xs={4}>
                      <Typography>{t("Contract")}</Typography>
                      <SelectNew
                        key={`contract-input`}
                        value={{
                          value: values.contractId,
                          label:
                            contractOptions.find(
                              e => e.value && e.value === values.contractId
                            )?.label || "",
                        }}
                        multiple={false}
                        onChange={(value: OptionType) => {
                          const id = (value as OptionTypeBase).value;
                          setFieldValue("contractId", id, !!errors?.contractId);
                        }}
                        options={contractOptions}
                        inputStatus={errors.contractId ? "error" : undefined}
                        validationMessage={errors.contractId}
                        withResetValue={false}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <Typography>{t("Hours in full day")}</Typography>
                      <Input
                        value={values.hoursPerFullWorkDay}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          placeholder: `E.g 8`,
                          name: "hoursPerFullWorkDay",
                          id: "hoursPerFullWorkDay",
                          fullWidth: false,
                        }}
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={10}>
                    <Divider className={classes.divider} />
                  </Grid>
                  <Grid item xs={10}>
                    {values.schedules.map((schedule: Schedule, i) => {
                      const otherSchedules = values.schedules.filter(
                        (s, index) => {
                          if (index !== i) {
                            return s;
                          }
                        }
                      );
                      const disabledDaysOfWeek =
                        flatMap(otherSchedules, (s => s.daysOfTheWeek) ?? []) ??
                        [];

                      return (
                        <div key={`schedule-${i}`}>
                          {i != 0 && <Divider className={classes.divider} />}
                          <ScheduleUI
                            index={i}
                            errors={errors}
                            multipleSchedules={values.schedules.length > 1}
                            lastSchedule={i === values.schedules.length - 1}
                            onDelete={() => {
                              values.schedules.splice(i, 1);
                              setFieldValue("schedules", values.schedules);
                            }}
                            schedule={schedule}
                            locationOptions={locationOptions}
                            bellSchedules={bellSchedules}
                            onCheckScheduleVaries={() => {
                              values.schedules.push(
                                buildNewSchedule(false, true)
                              );
                              setFieldValue("schedules", values.schedules);
                            }}
                            onAddSchedule={() => {
                              values.schedules.push(
                                buildNewSchedule(false, true)
                              );
                              setFieldValue("schedules", values.schedules);
                            }}
                            onRemoveSchool={index => {
                              values.schedules[i].periods.splice(index, 1);
                              setFieldValue("schedules", values.schedules);
                            }}
                            onAddSchool={() => {
                              values.schedules[i].periods[0].allDay = false;
                              values.schedules[i].periods.push(
                                buildNewPeriod(false)
                              );
                              setFieldValue("schedules", values.schedules);
                            }}
                            disabledDaysOfWeek={disabledDaysOfWeek}
                            onCheckDayOfWeek={(dow: DayOfWeek) => {
                              const dayIndex = schedule.daysOfTheWeek.indexOf(
                                dow
                              );
                              if (dayIndex != -1) {
                                schedule.daysOfTheWeek.splice(dayIndex, 1);
                              } else {
                                schedule.daysOfTheWeek.push(dow);
                              }
                              values.schedules[i] = schedule;
                              setFieldValue("schedules", values.schedules);
                            }}
                            onChangeLocation={(
                              locationId: string,
                              index: number
                            ) => {
                              const locationGroupId =
                                locations.find(x => x.id === locationId)
                                  ?.locationGroupId ?? "";
                              values.schedules[i].periods[
                                index
                              ].locationId = locationId;
                              values.schedules[i].periods[
                                index
                              ].locationGroupId = locationGroupId;
                              setFieldValue("schedules", values.schedules);
                            }}
                            onChangeBellSchedule={(
                              bellScheduleId: string,
                              index: number
                            ) => {
                              values.schedules[i].periods[
                                index
                              ].bellScheduleId = bellScheduleId;
                              if (
                                values.schedules[i].periods[index].allDay &&
                                bellScheduleId !== "custom"
                              ) {
                                const bellSchedule = bellSchedules.find(
                                  x => x?.id === bellScheduleId
                                );
                                values.schedules[i].periods[
                                  index
                                ].startPeriodId =
                                  bellSchedule!.periods![0]!.id ?? undefined;
                                values.schedules[i].periods[index].endPeriodId =
                                  bellSchedule!.periods![
                                    bellSchedule!.periods!.length - 1
                                  ]!.id ?? undefined;
                                values.schedules[i].periods[
                                  index
                                ].startTime = null;
                                values.schedules[i].periods[
                                  index
                                ].endTime = null;
                              }
                              setFieldValue("schedules", values.schedules);
                            }}
                            onCheckAllDay={(allDay: boolean) => {
                              values.schedules[i].periods[0].allDay = allDay;
                              if (
                                allDay &&
                                values.schedules[i].periods[0].bellScheduleId
                              ) {
                                const bellSchedule = bellSchedules.find(
                                  x =>
                                    x?.id ===
                                    values.schedules[i].periods[0]
                                      .bellScheduleId
                                );
                                values.schedules[i].periods[0].startPeriodId =
                                  bellSchedule!.periods![0]!.id ?? undefined;
                                values.schedules[i].periods[0].endPeriodId =
                                  bellSchedule!.periods![
                                    bellSchedule!.periods!.length - 1
                                  ]!.id ?? undefined;
                                values.schedules[i].periods[0].startTime = null;
                                values.schedules[i].periods[0].endTime = null;
                              } else if (!allDay) {
                                values.schedules[
                                  i
                                ].periods[0].startPeriodId = undefined;
                                values.schedules[
                                  i
                                ].periods[0].endPeriodId = undefined;
                              }
                              setFieldValue("schedules", values.schedules);
                            }}
                            onChangeStartPeriod={(
                              startPeriodId: string,
                              index: number
                            ) => {
                              values.schedules[i].periods[
                                index
                              ].startPeriodId = startPeriodId;
                              values.schedules[i].periods[
                                index
                              ].startTime = null;
                              setFieldValue("schedules", values.schedules);
                            }}
                            onChangeEndPeriod={(
                              endPeriodId: string,
                              index: number
                            ) => {
                              values.schedules[i].periods[
                                index
                              ].endPeriodId = endPeriodId;
                              values.schedules[i].periods[index].endTime = null;
                              setFieldValue("schedules", values.schedules);
                            }}
                          />
                        </div>
                      );
                    })}
                  </Grid>
                </Grid>
                <ActionButtons
                  submit={{ text: props.submitLabel, execute: submitForm }}
                  cancel={{ text: t("Cancel"), execute: props.onCancel }}
                />
              </Section>
            </form>
          );
        }}
      </Formik>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: {
    marginBottom: theme.spacing(2),
  },
  title: {
    marginBottom: 0,
  },
  cancel: { color: theme.customColors.darkRed },
  divider: {
    color: theme.customColors.gray,
    marginBottom: theme.spacing(2),
  },
}));
