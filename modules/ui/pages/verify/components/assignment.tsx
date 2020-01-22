import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { Grid, Button, Typography, makeStyles } from "@material-ui/core";
import {
  VacancyDetail,
  VacancyDetailVerifyInput,
  AbsenceReasonTrackingTypeId,
  DayConversion,
  PayCode,
  AccountingCode,
  PermissionEnum,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { parseISO, format, isEqual } from "date-fns";
import clsx from "clsx";
import * as yup from "yup";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { OptionTypeBase } from "react-select/src/types";
import { getDisplayName } from "ui/components/enumHelpers";
import { minutesToHours, hoursToMinutes } from "ui/components/helpers";
import { getPayLabel } from "ui/components/helpers";
import { Can } from "ui/components/auth/can";

type Props = {
  vacancyDetail: Pick<
    VacancyDetail,
    | "id"
    | "orgId"
    | "startTimeLocal"
    | "startDate"
    | "endTimeLocal"
    | "assignment"
    | "payCode"
    | "location"
    | "vacancy"
    | "dayPortion"
    | "totalDayPortion"
    | "accountingCodeAllocations"
    | "verifyComments"
    | "verifiedAtLocal"
    | "payDurationOverride"
    | "actualDuration"
    | "payTypeId"
    | "payInfo"
  >;
  shadeRow: boolean;
  onVerify: (verifyInput: VacancyDetailVerifyInput) => Promise<void>;
  onSelectDetail: (vacancyDetailId: string) => void;
  selectedVacancyDetail: string | undefined;
  payCodeOptions: OptionType[];
  vacancyDayConversions: Pick<
    DayConversion,
    "name" | "maxMinutes" | "dayEquivalent"
  >[];
};

export const Assignment: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vacancyDetail = props.vacancyDetail;
  const [currentPayCode, setCurrentPayCode] = useState<
    Pick<PayCode, "id" | "name"> | undefined
  >(vacancyDetail.payCode ?? undefined);
  const [currentAccountingCode, setCurrentAccountingCode] = useState<
    Pick<AccountingCode, "id" | "name"> | undefined
  >(vacancyDetail.accountingCodeAllocations![0]?.accountingCode ?? undefined);
  const [selectedDayConversionName, setSelectedDayConversionName] = useState<
    string
  >();
  const dayConversionHourlyName = t("Hourly");

  // If the date is null, this record is not verified and needs to be verified
  // If it is verified, we would want to allow the record to be unverified
  const notVerified = vacancyDetail.verifiedAtLocal === null;

  const accountingCodes = useAccountingCodes(vacancyDetail.orgId.toString(), [
    +vacancyDetail.location!.id,
  ]);
  const accountingCodeOptions = useMemo(
    () => accountingCodes.map(a => ({ label: a.name, value: a.id })),
    [accountingCodes]
  );

  const vacancyDetailStartTime = parseISO(vacancyDetail.startTimeLocal);
  const vacancyDetailEndTime = parseISO(vacancyDetail.endTimeLocal);
  const absenceDetail = vacancyDetail.vacancy!.absence!.details!.find(o =>
    isEqual(
      parseISO(o?.startDate),
      new Date(
        vacancyDetailStartTime.getFullYear(),
        vacancyDetailStartTime.getMonth(),
        vacancyDetailStartTime.getDate()
      )
    )
  );
  const absenceDetailStartTime = parseISO(absenceDetail?.startTimeLocal);
  const absenceDetailEndTime = parseISO(absenceDetail?.endTimeLocal);

  const isActiveCard = props.selectedVacancyDetail
    ? vacancyDetail.id === props.selectedVacancyDetail
    : false;

  // Build dropdown options list for the Day Conversions
  const dayConversionOptions = useMemo(() => {
    return [
      ...props.vacancyDayConversions
        .sort((a, b) => {
          return b.dayEquivalent - a.dayEquivalent;
        })
        .map(a => ({
          label: a.name,
          value: a.name,
        })),
      {
        label: dayConversionHourlyName,
        value: AbsenceReasonTrackingTypeId.Hourly,
      },
    ];
  }, [props.vacancyDayConversions, dayConversionHourlyName]);

  // Make sure the dayConversionName is initially set
  useEffect(() => {
    if (
      !vacancyDetail.dayPortion ||
      vacancyDetail.payTypeId === AbsenceReasonTrackingTypeId.Hourly
    ) {
      setSelectedDayConversionName(
        dayConversionOptions.find(
          x => x.value === AbsenceReasonTrackingTypeId.Hourly
        )?.label
      );
      return;
    }
    if (vacancyDetail.payInfo?.match) {
      setSelectedDayConversionName(
        dayConversionOptions.find(
          x =>
            x.label === vacancyDetail.payInfo?.dayConversion?.name &&
            x.value === vacancyDetail.payInfo?.dayConversion?.name
        )?.label
      );
      return;
    }
    setSelectedDayConversionName(
      dayConversionOptions.find(
        x => x.value === AbsenceReasonTrackingTypeId.Hourly
      )?.label
    );
  }, [
    props.vacancyDayConversions,
    dayConversionOptions,
    vacancyDetail.dayPortion,
    vacancyDetail.payTypeId,
    vacancyDetail.payInfo,
  ]);

  // Get the current PayTypeId based on the current selectedDayConversion
  const payTypeId = useMemo(() => {
    const matchingDayConversion = props.vacancyDayConversions.find(
      x => x.name === selectedDayConversionName
    );
    return matchingDayConversion
      ? AbsenceReasonTrackingTypeId.Daily
      : AbsenceReasonTrackingTypeId.Hourly;
  }, [selectedDayConversionName, props.vacancyDayConversions]);

  const payLabel = useMemo(
    () =>
      getPayLabel(
        vacancyDetail.payInfo?.match ?? false,
        vacancyDetail.payInfo?.payTypeId ?? AbsenceReasonTrackingTypeId.Daily,
        vacancyDetail.payInfo?.label ?? "",
        vacancyDetail.dayPortion,
        vacancyDetail.totalDayPortion,
        t
      ),
    [
      vacancyDetail.dayPortion,
      vacancyDetail.totalDayPortion,
      vacancyDetail.payInfo,
      t,
    ]
  );

  const handlePayCodeOnBlur = async (payCodeId: string | undefined) => {
    if (currentPayCode?.id === payCodeId) {
      // Don't call the mutation if we're not chaning anything
      return;
    }

    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      payCodeId: payCodeId ? Number(payCodeId) : null,
    });

    // Find the pay code option that matches our selection and set in state
    const payCode = props.payCodeOptions.find(x => x.value === payCodeId);
    setCurrentPayCode(
      payCode ? { id: payCodeId!, name: payCode.label.toString() } : undefined
    );
  };

  const handleAccountingCodeOnBlur = async (
    accountingCodeId: string | undefined
  ) => {
    if (currentAccountingCode?.id === accountingCodeId) {
      // Don't call the mutation if we're not chaning anything
      return;
    }

    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      accountingCodeAllocations: accountingCodeId
        ? [
            {
              accountingCodeId: Number(accountingCodeId),
              allocation: 1.0,
            },
          ]
        : [],
    });

    // Find the accounting code option that matches our selection and set in state
    const accountingCode = accountingCodeOptions.find(
      x => x.value === accountingCodeId
    );
    setCurrentAccountingCode(
      accountingCode
        ? { id: accountingCodeId!, name: accountingCode.label.toString() }
        : undefined
    );
  };

  const handleCommentsOnBlur = async (verifyComments: string | undefined) => {
    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      verifyComments,
    });
  };

  const handleDaysUpdate = async (
    dayPortion: number,
    payDurationOverrideHours: number | null | undefined,
    dayConversionName: string | undefined
  ) => {
    // Find the matching day conversion
    const dayConversion = props.vacancyDayConversions.find(
      x => x.name === dayConversionName
    );

    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      dayPortion: dayConversion?.dayEquivalent ?? dayPortion,
      payDurationOverride: !dayConversion
        ? Number(hoursToMinutes(payDurationOverrideHours ?? undefined))
        : null,
      payTypeId: dayConversion
        ? AbsenceReasonTrackingTypeId.Daily
        : AbsenceReasonTrackingTypeId.Hourly,
    });
  };

  return (
    <div
      onClick={() => props.onSelectDetail(vacancyDetail.id)}
      className={clsx({
        [classes.shadedRow]: props.shadeRow,
        [classes.cardSelection]: isActiveCard,
        [classes.cardRoot]: true,
      })}
    >
      <Formik
        initialValues={{
          verifyComments: vacancyDetail.verifyComments ?? undefined,
          payCodeId: currentPayCode?.id ?? undefined,
          dayPortion: vacancyDetail.dayPortion,
          accountingCodeId: currentAccountingCode?.id ?? undefined,
          payDurationOverrideHours: minutesToHours(
            vacancyDetail.payDurationOverride ??
              vacancyDetail.actualDuration ??
              undefined
          ),
        }}
        onSubmit={async (data, e) => {
          // Find the matching day conversion
          const dayConversion = props.vacancyDayConversions.find(
            x => x.name === selectedDayConversionName
          );

          await props.onVerify({
            vacancyDetailId: vacancyDetail.id,
            payCodeId: data.payCodeId ? Number(data.payCodeId) : null,
            verifyComments: data.verifyComments,
            accountingCodeAllocations: data.accountingCodeId
              ? [
                  {
                    accountingCodeId: Number(data.accountingCodeId),
                    allocation: 1.0,
                  },
                ]
              : [],
            dayPortion: dayConversion?.dayEquivalent ?? data.dayPortion,
            payTypeId: dayConversion
              ? AbsenceReasonTrackingTypeId.Daily
              : AbsenceReasonTrackingTypeId.Hourly,
            payDurationOverride: !dayConversion
              ? Number(
                  hoursToMinutes(data.payDurationOverrideHours ?? undefined)
                )
              : null,
            doVerify: notVerified,
          });
        }}
        validationSchema={yup.object().shape({
          dayPortion: yup.number().typeError(t("Not a valid number")),
          payDurationOverrideHours: yup
            .number()
            .nullable()
            .typeError(t("Not a valid number")),
          verifyComments: yup.string().nullable(),
        })}
      >
        {({ values, handleSubmit, submitForm, setFieldValue, errors }) => (
          <form onSubmit={handleSubmit}>
            <Grid
              container
              justify="space-between"
              alignItems="flex-start"
              spacing={2}
              className={classes.container}
            >
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {`${t("Absence")} #${vacancyDetail.vacancy!.absence!.id}`}
                </Typography>
                <Typography className={classes.regularText}>{`${t(
                  "Assignment"
                )} #C${vacancyDetail.assignment!.id}`}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {`${vacancyDetail.vacancy!.absence!.employee!.firstName} ${
                    vacancyDetail.vacancy!.absence!.employee!.lastName
                  }`}
                </Typography>
                <Typography className={classes.boldText}>{`${
                  vacancyDetail.assignment!.employee!.firstName
                } ${vacancyDetail.assignment!.employee!.lastName}`}</Typography>
              </Grid>
              <Grid item xs={3}>
                <Typography className={classes.lightText}>
                  {`${getDisplayName(
                    "dayPart",
                    absenceDetail!.dayPartId!.toString(),
                    t
                  )} (${format(absenceDetailStartTime, "h:mmaaa")}-${format(
                    absenceDetailEndTime,
                    "h:mmaaa"
                  )})`}
                </Typography>
                <Typography className={classes.regularText}>{`${format(
                  vacancyDetailStartTime,
                  "h:mm aaa"
                )} - ${format(vacancyDetailEndTime, "h:mm aaa")}`}</Typography>
                {!isActiveCard && (
                  <Typography className={classes.boldText}>
                    {payLabel}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {vacancyDetail.vacancy!.position!.name}
                </Typography>
                {!isActiveCard && (
                  <Typography
                    className={classes.boldText}
                  >{`Pay: ${currentPayCode?.name ?? t("N/A")}`}</Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {vacancyDetail.location!.name}
                </Typography>
                {!isActiveCard && (
                  <Typography
                    className={classes.boldText}
                  >{`Acct: ${currentAccountingCode?.name ??
                    t("N/A")}`}</Typography>
                )}
              </Grid>
              <Grid item xs={1}>
                {!isActiveCard && (
                  <Button
                    variant={isActiveCard ? "contained" : "outlined"}
                    type="submit"
                    onClick={event => {
                      event.stopPropagation();
                      onsubmit;
                    }}
                  >
                    {notVerified ? t("Verify") : t("Undo verify")}
                  </Button>
                )}
              </Grid>
            </Grid>
            {isActiveCard && (
              <div>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                  className={[
                    props.shadeRow ? classes.shadedRow : undefined,
                    classes.container,
                  ].join(" ")}
                >
                  <Grid item xs={2}></Grid>
                  <Grid item xs={2}>
                    <Can do={[PermissionEnum.AbsVacSave]}>
                      <SelectNew
                        value={dayConversionOptions.find(
                          a => a.label === selectedDayConversionName
                        )}
                        onChange={async (e: OptionType) => {
                          //TODO: Once the select component is updated,
                          // can remove the Array checking
                          let selectedLabel: string | undefined = undefined;
                          if (e) {
                            if (Array.isArray(e)) {
                              selectedLabel = (e as Array<OptionTypeBase>)[0]
                                .label;
                            } else {
                              selectedLabel = (e as OptionTypeBase).label;
                            }
                          }
                          setSelectedDayConversionName(selectedLabel);
                          await handleDaysUpdate(
                            values.dayPortion,
                            values.payDurationOverrideHours,
                            selectedLabel
                          );
                        }}
                        options={dayConversionOptions}
                        multiple={false}
                        withResetValue={false}
                      />
                    </Can>
                    <Can not do={[PermissionEnum.AbsVacSave]}>
                      <Typography className={classes.boldText}>
                        {selectedDayConversionName}
                      </Typography>
                    </Can>
                  </Grid>

                  <Grid item xs={3}>
                    {payTypeId === AbsenceReasonTrackingTypeId.Daily ? (
                      <Typography className={classes.boldText}>
                        {payLabel}
                      </Typography>
                    ) : (
                      <>
                        <Can do={[PermissionEnum.AbsVacSave]}>
                          <Input
                            value={values.payDurationOverrideHours ?? ""}
                            InputComponent={FormTextField}
                            inputComponentProps={{
                              name: "payDurationOverrideHours",
                              margin: "normal",
                              label: t("Hours"),
                              fullWidth: true,
                            }}
                            onChange={(
                              event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                              setFieldValue(
                                "payDurationOverrideHours",
                                event.target.value
                                  ? event.target.value
                                  : minutesToHours(
                                      vacancyDetail.actualDuration ?? undefined
                                    )
                              );
                            }}
                            onBlur={() =>
                              handleDaysUpdate(
                                values.dayPortion,
                                values.payDurationOverrideHours,
                                selectedDayConversionName
                              )
                            }
                          />
                        </Can>
                        <Can not do={[PermissionEnum.AbsVacSave]}>
                          <Typography className={classes.boldText}>
                            {payLabel}
                          </Typography>
                        </Can>
                      </>
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    <Can do={[PermissionEnum.AbsVacSavePayCode]}>
                      <SelectNew
                        label={t("Pay Code")}
                        value={{
                          value: values.payCodeId ?? "",
                          label:
                            props.payCodeOptions.find(
                              a => a.value === values.payCodeId
                            )?.label || "",
                        }}
                        onChange={(e: OptionType) => {
                          //TODO: Once the select component is updated,
                          // can remove the Array checking
                          let selectedValue = null;
                          if (e) {
                            if (Array.isArray(e)) {
                              selectedValue = (e as Array<OptionTypeBase>)[0]
                                .value;
                            } else {
                              selectedValue = (e as OptionTypeBase).value;
                            }
                          }
                          setFieldValue("payCodeId", selectedValue);
                        }}
                        multiple={false}
                        options={props.payCodeOptions}
                        onBlur={() => handlePayCodeOnBlur(values.payCodeId)}
                      />
                    </Can>
                    <Can not do={[PermissionEnum.AbsVacSavePayCode]}>
                      <Typography
                        className={classes.boldText}
                      >{`Pay: ${currentPayCode?.name ?? t("N/A")}`}</Typography>
                    </Can>
                  </Grid>
                  <Grid item xs={2}>
                    <Can do={[PermissionEnum.AbsVacSaveAccountCode]}>
                      <SelectNew
                        label={t("Accounting Code")}
                        value={{
                          value: values.accountingCodeId ?? "",
                          label:
                            accountingCodeOptions.find(
                              a => a.value === values.accountingCodeId
                            )?.label || "",
                        }}
                        onChange={(e: OptionType) => {
                          //TODO: Once the select component is updated,
                          // can remove the Array checking
                          let selectedValue = null;
                          if (e) {
                            if (Array.isArray(e)) {
                              selectedValue = (e as Array<OptionTypeBase>)[0]
                                .value;
                            } else {
                              selectedValue = (e as OptionTypeBase).value;
                            }
                          }
                          setFieldValue("accountingCodeId", selectedValue);
                        }}
                        options={accountingCodeOptions}
                        onBlur={() =>
                          handleAccountingCodeOnBlur(values.accountingCodeId)
                        }
                        multiple={false}
                      />
                    </Can>
                    <Can not do={[PermissionEnum.AbsVacSaveAccountCode]}>
                      <Typography
                        className={classes.boldText}
                      >{`Acct: ${currentAccountingCode?.name ??
                        t("N/A")}`}</Typography>
                    </Can>
                  </Grid>
                  <Grid item xs={1}></Grid>
                </Grid>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                  className={[
                    props.shadeRow ? classes.shadedRow : undefined,
                    classes.container,
                  ].join(" ")}
                >
                  <Grid item xs={4}></Grid>
                  <Grid item xs={7}>
                    <Can do={[PermissionEnum.AbsVacSave]}>
                      <Input
                        value={values.verifyComments}
                        InputComponent={FormTextField}
                        inputComponentProps={{
                          name: "verifyComments",
                          margin: "normal",
                          fullWidth: true,
                          placeholder: t("Comments"),
                        }}
                        onBlur={() =>
                          handleCommentsOnBlur(values.verifyComments)
                        }
                      />
                    </Can>
                  </Grid>
                  <Grid item xs={1}>
                    <Button
                      variant={isActiveCard ? "contained" : "outlined"}
                      type="submit"
                    >
                      {notVerified ? t("Verify") : t("Undo verify")}
                    </Button>
                  </Grid>
                </Grid>
              </div>
            )}
          </form>
        )}
      </Formik>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  lightText: {
    fontSize: theme.typography.fontSize,
    color: theme.customColors.edluminSubText,
  },
  regularText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "normal",
  },
  boldText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },
  cardRoot: {
    cursor: "pointer",
    padding: theme.spacing(2),
  },
  cardSelection: {
    boxShadow:
      "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
    opacity: 1,
    marginBottom: theme.spacing(1),
  },
  container: { width: "100%" },
}));
