import * as React from "react";
import { useMemo, useEffect, useState } from "react";
import { Grid, Button, Link, Typography, makeStyles } from "@material-ui/core";
import {
  VacancyDetail,
  VacancyDetailVerifyInput,
  AbsenceReasonTrackingTypeId,
  DayConversion,
  PermissionEnum,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useQueryBundle } from "graphql/hooks";
import { GetVacancyNotes } from "../graphql/get-vacancy-notes.gen";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { parseISO, format } from "date-fns";
import clsx from "clsx";
import * as yup from "yup";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { OptionTypeBase } from "react-select/src/types";
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
    | "payCodeId"
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
    | "vacancyReason"
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
  goToEdit: (vacancyId: string, absenceId?: string | null) => void;
};

export const Assignment: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vacancyDetail = props.vacancyDetail;
  const [currentPayCodeId, setCurrentPayCodeId] = useState<string | undefined>(
    vacancyDetail.payCodeId ?? undefined
  );
  const [currentAccountingCodeId, setCurrentAccountingCodeId] = useState<
    string | undefined
  >(vacancyDetail.accountingCodeAllocations[0]?.accountingCodeId ?? undefined);
  const [selectedDayConversionName, setSelectedDayConversionName] = useState<
    string
  >();

  const isFromVacancy = useMemo(() => {
    return !!vacancyDetail.vacancyReason;
  }, [vacancyDetail]);

  const dayConversionHourlyName = t("Hourly");

  // If the date is null, this record is not verified and needs to be verified
  // If it is verified, we would want to allow the record to be unverified
  const notVerified = vacancyDetail.verifiedAtLocal === null;

  const accountingCodes = useAccountingCodes(
    vacancyDetail.orgId,
    vacancyDetail.location ? [vacancyDetail.location.id] : undefined
  );
  const accountingCodeOptions = useMemo(
    () => accountingCodes.map(a => ({ label: a.name, value: a.id })),
    [accountingCodes]
  );

  const vacancyDetailStartTime = parseISO(vacancyDetail.startTimeLocal);
  const vacancyDetailEndTime = parseISO(vacancyDetail.endTimeLocal);

  const isActiveCard = props.selectedVacancyDetail
    ? vacancyDetail.id === props.selectedVacancyDetail
    : false;

  const travelingTeacher: boolean = useMemo(() => {
    if (
      vacancyDetail.payTypeId &&
      vacancyDetail.payTypeId === "DAILY" &&
      vacancyDetail.dayPortion !== 1 &&
      vacancyDetail.dayPortion !== 0.5
    ) {
      return true;
    } else {
      return false;
    }
  }, [vacancyDetail.payTypeId, vacancyDetail.dayPortion]);

  // Build dropdown options list for the Day Conversions
  const dayConversionOptions = useMemo(() => {
    const options = [
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

    if (travelingTeacher) {
      options.push({
        label: vacancyDetail.payInfo?.label
          ? vacancyDetail.payInfo?.label
          : `${parseFloat(vacancyDetail.dayPortion).toFixed(2)} ${t("Days")}`,
        value: parseFloat(vacancyDetail.dayPortion).toFixed(2),
      });
    }
    return options;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    props.vacancyDayConversions,
    dayConversionHourlyName,
    travelingTeacher,
    vacancyDetail.dayPortion,
  ]);

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

    if (travelingTeacher) {
      setSelectedDayConversionName(
        dayConversionOptions.find(
          x => x.value === parseFloat(vacancyDetail.dayPortion).toFixed(2)
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
    travelingTeacher,
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

  const absenceReason = !isFromVacancy
    ? vacancyDetail.vacancy!.absence!.details?.[0]?.reasonUsages?.[0]
        ?.absenceReason?.name
    : "";

  const vacancyReason = vacancyDetail.vacancyReason?.name;

  const payLabel = useMemo(() => {
    if (travelingTeacher && vacancyDetail.payInfo?.label) {
      return vacancyDetail.payInfo?.label || "";
    } else {
      return getPayLabel(
        vacancyDetail.payInfo?.match ?? false,
        vacancyDetail.payInfo?.payTypeId ?? AbsenceReasonTrackingTypeId.Daily,
        vacancyDetail.payInfo?.label ?? "",
        vacancyDetail.dayPortion,
        vacancyDetail.totalDayPortion,
        t
      );
    }
  }, [
    vacancyDetail.dayPortion,
    vacancyDetail.totalDayPortion,
    vacancyDetail.payInfo,
    travelingTeacher,
    t,
  ]);

  const getVacancyNotes = useQueryBundle(GetVacancyNotes, {
    variables: {
      vacancyId: vacancyDetail.vacancy?.id,
    },
    skip: !!vacancyDetail.vacancy?.absence,
  });

  const notesToAdministrator = vacancyDetail.vacancy?.absence?.notesToApprover;

  const adminOnlyNotes =
    vacancyDetail.vacancy?.absence?.adminOnlyNotes ??
    (getVacancyNotes.state != "LOADING"
      ? getVacancyNotes.data.vacancy?.byId?.adminOnlyNotes ?? undefined
      : undefined);

  const payCodeLabel = props.payCodeOptions.find(
    x => x.value === currentPayCodeId
  )?.label;

  const accountingCodeLabel = accountingCodeOptions.find(
    x => x.value === currentAccountingCodeId
  )?.label;

  const handlePayCodeOnChange = async (payCodeId: string | undefined) => {
    if (currentPayCodeId === payCodeId) {
      // Don't call the mutation if we're not chaning anything
      return;
    }

    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      payCodeId: payCodeId ? payCodeId : null,
    });

    // Find the pay code option that matches our selection and set in state
    const payCode = props.payCodeOptions.find(x => x.value === payCodeId);

    setCurrentPayCodeId(payCode ? payCodeId! : undefined);
  };

  const handleAccountingCodeOnChange = async (
    accountingCodeId: string | undefined
  ) => {
    if (currentAccountingCodeId === accountingCodeId) {
      // Don't call the mutation if we're not chaning anything
      return;
    }

    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      accountingCodeAllocations: accountingCodeId
        ? [
            {
              accountingCodeId: accountingCodeId,
              allocation: 1.0,
            },
          ]
        : [],
    });

    // Find the accounting code option that matches our selection and set in state
    const accountingCode = accountingCodeOptions.find(
      x => x.value === accountingCodeId
    );
    setCurrentAccountingCodeId(accountingCode ? accountingCodeId : undefined);
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
      payDurationOverride:
        !dayConversion && !travelingTeacher
          ? Number(hoursToMinutes(payDurationOverrideHours ?? undefined))
          : null,
      payTypeId:
        dayConversion || travelingTeacher
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
          payCodeId: currentPayCodeId ?? undefined,
          dayPortion: vacancyDetail.dayPortion,
          accountingCodeId: currentAccountingCodeId ?? undefined,
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
            payCodeId: data.payCodeId ? data.payCodeId : null,
            verifyComments: data.verifyComments,
            accountingCodeAllocations: data.accountingCodeId
              ? [
                  {
                    accountingCodeId: data.accountingCodeId,
                    allocation: 1.0,
                  },
                ]
              : [],
            dayPortion: dayConversion?.dayEquivalent ?? data.dayPortion,
            payTypeId:
              dayConversion || travelingTeacher
                ? AbsenceReasonTrackingTypeId.Daily
                : AbsenceReasonTrackingTypeId.Hourly,
            payDurationOverride:
              !dayConversion && !travelingTeacher
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
              <Grid item xs={1}>
                <Link
                  className={classes.boldText}
                  onClick={() =>
                    props.goToEdit(
                      vacancyDetail.vacancy!.id,
                      vacancyDetail.vacancy!.absence?.id
                    )
                  }
                >
                  {`#C${vacancyDetail.assignment!.id}`}
                </Link>
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.boldText}>
                  {`${vacancyDetail.assignment!.employee?.firstName ??
                    ""} ${vacancyDetail.assignment!.employee?.lastName ?? ""}`}
                </Typography>
                {!isFromVacancy && (
                  <Typography className={classes.lightText}>{`for ${
                    vacancyDetail.vacancy!.absence!.employee!.firstName
                  } ${
                    vacancyDetail.vacancy!.absence!.employee!.lastName
                  }`}</Typography>
                )}
                {isFromVacancy && (
                  <Typography className={classes.lightText}>{`for ${t(
                    "Vacancy"
                  )}: ${vacancyDetail.vacancy!.position!.title}`}</Typography>
                )}
                {!isFromVacancy && absenceReason ? (
                  <Typography
                    className={classes.lightText}
                  >{`${absenceReason}`}</Typography>
                ) : isFromVacancy && vacancyReason ? (
                  <Typography
                    className={classes.lightText}
                  >{`${vacancyReason}`}</Typography>
                ) : (
                  <></>
                )}
              </Grid>
              <Grid item container direction="column" xs={8}>
                <Grid item container>
                  <Grid item xs={4}>
                    <Typography className={classes.regularText}>{`${format(
                      vacancyDetailStartTime,
                      "h:mm aaa"
                    )} - ${format(
                      vacancyDetailEndTime,
                      "h:mm aaa"
                    )}`}</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography className={classes.regularText}>
                      {vacancyDetail.vacancy!.position!.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography className={classes.regularText}>
                      {vacancyDetail.location?.name ?? ""}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid item container alignItems="flex-end">
                  <Grid item xs={4}>
                    {isActiveCard ? (
                      <>
                        <Grid
                          item
                          className={classes.topMargin}
                          xs={
                            travelingTeacher ||
                            payTypeId === AbsenceReasonTrackingTypeId.Daily
                              ? 12
                              : 8
                          }
                        >
                          <Can do={[PermissionEnum.AbsVacSave]}>
                            <Typography className={classes.boldText}>
                              {t("Pay:")}
                            </Typography>
                            <SelectNew
                              value={dayConversionOptions.find(
                                a => a.label === selectedDayConversionName
                              )}
                              onChange={async (e: OptionType) => {
                                let selectedLabel:
                                  | string
                                  | undefined = undefined;
                                if (e) {
                                  if (Array.isArray(e)) {
                                    selectedLabel = (e as Array<
                                      OptionTypeBase
                                    >)[0].label;
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
                        </Grid>
                        {!travelingTeacher &&
                        payTypeId === AbsenceReasonTrackingTypeId.Hourly ? (
                          <>
                            <Grid item xs={3} className={classes.hourlyInput}>
                              <Can do={[PermissionEnum.AbsVacSavePayCode]}>
                                <Input
                                  value={values.payDurationOverrideHours ?? ""}
                                  InputComponent={FormTextField}
                                  classes={{ root: classes.root }}
                                  inputComponentProps={{
                                    name: "payDurationOverrideHours",
                                    margin: "normal",
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
                                            vacancyDetail.actualDuration ??
                                              undefined
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
                            </Grid>
                          </>
                        ) : (
                          <></>
                        )}
                      </>
                    ) : (
                      <Typography className={classes.lightText}>
                        {t("Pay: " + payLabel + "")}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    {isActiveCard ? (
                      <>
                        <Can do={[PermissionEnum.AbsVacSavePayCode]}>
                          <Typography className={classes.boldText}>
                            {t("Pay code:")}
                          </Typography>
                          <SelectNew
                            value={{
                              value: values.payCodeId ?? "",
                              label:
                                props.payCodeOptions.find(
                                  a => a.value === values.payCodeId
                                )?.label || "",
                            }}
                            onChange={async (e: OptionType) => {
                              let selectedValue = null;
                              if (e) {
                                if (Array.isArray(e)) {
                                  selectedValue = (e as Array<
                                    OptionTypeBase
                                  >)[0].value;
                                } else {
                                  selectedValue = (e as OptionTypeBase).value;
                                }
                              }
                              setFieldValue("payCodeId", selectedValue);
                              await handlePayCodeOnChange(selectedValue);
                            }}
                            multiple={false}
                            options={props.payCodeOptions}
                          />
                        </Can>
                        <Can not do={[PermissionEnum.AbsVacSavePayCode]}>
                          <Typography
                            className={classes.boldText}
                          >{`Pay: ${payCodeLabel ?? t("N/A")}`}</Typography>
                        </Can>
                      </>
                    ) : (
                      <Typography
                        className={classes.lightText}
                      >{`Code: ${payCodeLabel ?? t("N/A")}`}</Typography>
                    )}
                  </Grid>
                  <Grid item xs={4}>
                    {isActiveCard ? (
                      <>
                        <Can do={[PermissionEnum.AbsVacSaveAccountCode]}>
                          <Typography className={classes.boldText}>
                            {t("Accounting code:")}
                          </Typography>
                          <SelectNew
                            value={{
                              value: values.accountingCodeId ?? "",
                              label:
                                accountingCodeOptions.find(
                                  a => a.value === values.accountingCodeId
                                )?.label || "",
                            }}
                            onChange={async (e: OptionType) => {
                              let selectedValue = null;
                              if (e) {
                                if (Array.isArray(e)) {
                                  selectedValue = (e as Array<
                                    OptionTypeBase
                                  >)[0].value;
                                } else {
                                  selectedValue = (e as OptionTypeBase).value;
                                }
                              }
                              setFieldValue("accountingCodeId", selectedValue);
                              await handleAccountingCodeOnChange(selectedValue);
                            }}
                            options={accountingCodeOptions}
                            multiple={false}
                          />
                        </Can>
                        <Can not do={[PermissionEnum.AbsVacSaveAccountCode]}>
                          <Typography
                            className={classes.boldText}
                          >{`Acct: ${accountingCodeLabel ??
                            t("N/A")}`}</Typography>
                        </Can>
                      </>
                    ) : (
                      <Typography
                        className={classes.lightText}
                      >{`Acct: ${accountingCodeLabel ?? t("N/A")}`}</Typography>
                    )}
                  </Grid>
                </Grid>
                {notesToAdministrator && (
                  <Grid item container direction="column">
                    <Typography className={classes.boldText}>
                      {t("Notes to Administrator:")}
                    </Typography>
                    <Typography>{notesToAdministrator}</Typography>
                  </Grid>
                )}
                {adminOnlyNotes && (
                  <Grid item container direction="column">
                    <Typography className={classes.boldText}>
                      {t("Administrator comments:")}
                    </Typography>
                    <Typography>{adminOnlyNotes}</Typography>
                  </Grid>
                )}
                {isActiveCard && (
                  <Can do={[PermissionEnum.AbsVacSave]}>
                    <Grid item container>
                      <Typography className={classes.boldText}>
                        {t("Verifier Comments:")}
                      </Typography>
                      <Input
                        value={values.verifyComments}
                        InputComponent={FormTextField}
                        classes={{ root: classes.root }}
                        inputComponentProps={{
                          name: "verifyComments",
                          margin: "normal",
                          fullWidth: true,
                        }}
                        onBlur={() =>
                          handleCommentsOnBlur(values.verifyComments)
                        }
                      />
                    </Grid>
                  </Can>
                )}
              </Grid>
              <Grid item xs={1}>
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
              </Grid>
            </Grid>
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
  root: {
    marginTop: "0px",
    backgroundColor: theme.customColors.white,
  },
  displayFlex: {
    display: "flex",
  },
  hourlyInput: {
    marginLeft: "18px",
    marginTop: "25px",
  },
  topMargin: {
    marginTop: "5px",
  },
}));
