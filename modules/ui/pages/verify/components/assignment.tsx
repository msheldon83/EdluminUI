import * as React from "react";
import { useMemo } from "react";
import { Grid, Button, Typography, makeStyles } from "@material-ui/core";
import {
  VacancyDetail,
  VacancyDetailVerifyInput,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { parseISO, format, isEqual } from "date-fns";
import clsx from "clsx";
import * as yup from "yup";
import { Formik } from "formik";
import { Input } from "ui/components/form/input";
import { Select, SelectValueType, OptionType } from "ui/components/form/select";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { OptionTypeBase } from "react-select/src/types";
import { getDisplayName } from "ui/components/enumHelpers";

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
  >;
  shadeRow: boolean;
  onVerify: (verifyInput: VacancyDetailVerifyInput) => Promise<void>;
  onSelectDetail: (vacancyDetailId: string) => void;
  selectedVacancyDetail: string | undefined;
  payCodeOptions: OptionType[];
};

export const Assignment: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const vacancyDetail = props.vacancyDetail;

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

  const payType = vacancyDetail.vacancy!.position!.positionType!.payTypeId!;
  const daysInfo =
    vacancyDetail.dayPortion === vacancyDetail.totalDayPortion
      ? `${vacancyDetail.dayPortion.toFixed(1)}`
      : `${vacancyDetail.dayPortion.toFixed(
          1
        )}/${vacancyDetail.totalDayPortion.toFixed(1)}`;
  const payInfo =
    payType === "DAILY"
      ? `${daysInfo} ${t("Days")}`
      : `${vacancyDetail.payDurationOverride ??
          vacancyDetail.actualDuration} ${t("Hours")}`;

  const handlePayCodeOnBlur = async (payCodeId: string | undefined) => {
    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      payCodeId: Number(payCodeId),
    });
  };

  const handleAccountingCodeOnBlur = async (
    accountingCodeId: string | undefined
  ) => {
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
  };

  const handleCommentsOnBlur = async (verifyComments: string | undefined) => {
    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      verifyComments,
    });
  };

  const handleDaysOnBlur = async (
    dayPortion: number,
    payDurationOverride: number | null | undefined
  ) => {
    await props.onVerify({
      vacancyDetailId: vacancyDetail.id,
      doVerify: null,
      dayPortion,
      payDurationOverride: payType === "HOURLY" ? payDurationOverride : null,
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
          payCodeId: vacancyDetail.payCode?.id ?? undefined,
          dayPortion: vacancyDetail.dayPortion,
          accountingCodeId:
            vacancyDetail.accountingCodeAllocations![0]?.accountingCode?.id ??
            undefined,
          payDurationOverride:
            vacancyDetail.payDurationOverride ?? vacancyDetail.actualDuration,
        }}
        onSubmit={async (data, e) => {
          await props.onVerify({
            vacancyDetailId: vacancyDetail.id,
            payCodeId: Number(data.payCodeId),
            verifyComments: data.verifyComments,
            accountingCodeAllocations: data.accountingCodeId
              ? [
                  {
                    accountingCodeId: Number(data.accountingCodeId),
                    allocation: 1.0,
                  },
                ]
              : [],
            dayPortion: data.dayPortion,
            payDurationOverride:
              payType === "HOURLY" ? data.payDurationOverride : null,
            doVerify: notVerified,
          });
        }}
        validationSchema={yup.object().shape({
          dayPortion: yup.number().typeError(t("Not a valid number")),
          payDurationOverride: yup
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
              alignItems="center"
              spacing={2}
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
              <Grid item xs={2}>
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
                    {payInfo}
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
                  >{`Pay: ${vacancyDetail.payCode?.name ??
                    t("N/A")}`}</Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {vacancyDetail.location!.name}
                </Typography>
                {!isActiveCard && (
                  <Typography
                    className={classes.boldText}
                  >{`Acct: ${vacancyDetail.accountingCodeAllocations![0]
                    ?.accountingCode?.name ?? t("N/A")}`}</Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                {!isActiveCard && (
                  <Button
                    variant={isActiveCard ? "contained" : "outlined"}
                    type="submit"
                    onClick={event => {event.stopPropagation(); onsubmit;}}
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
                  className={props.shadeRow ? classes.shadedRow : undefined}
                >
                  <Grid item xs={4}></Grid>
                  <Grid item xs={2}>
                    <Input
                      value={
                        payType === "DAILY"
                          ? values.dayPortion
                          : values.payDurationOverride
                      }
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name:
                          payType === "DAILY"
                            ? "dayPortion"
                            : "payDurationOverride",
                        margin: "normal",
                        label: payType === "DAILY" ? t("Days") : t("Hours"),
                        fullWidth: true,
                      }}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>
                      ) => {
                        setFieldValue(
                          payType === "DAILY"
                            ? "dayPortion"
                            : "payDurationOverride",
                          event.target.value
                        );
                      }}
                      onBlur={() =>
                        handleDaysOnBlur(
                          values.dayPortion,
                          values.payDurationOverride
                        )
                      }
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Select
                      value={{
                        value: values.payCodeId,
                        label:
                          props.payCodeOptions.find(
                            a => a.value === values.payCodeId
                          )?.label || "",
                      }}
                      onChange={(e: SelectValueType) => {
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
                      options={props.payCodeOptions}
                      isClearable={!!values.payCodeId}
                      onBlur={() => handlePayCodeOnBlur(values.payCodeId)}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <Select
                      value={{
                        value: values.accountingCodeId,
                        label:
                          accountingCodeOptions.find(
                            a => a.value === values.accountingCodeId
                          )?.label || "",
                      }}
                      onChange={(e: SelectValueType) => {
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
                      isClearable={!!values.accountingCodeId}
                      onBlur={() =>
                        handleAccountingCodeOnBlur(values.accountingCodeId)
                      }
                    />
                  </Grid>
                  <Grid item xs={2}></Grid>
                </Grid>
                <Grid
                  container
                  justify="space-between"
                  alignItems="center"
                  spacing={2}
                  className={props.shadeRow ? classes.shadedRow : undefined}
                >
                  <Grid item xs={4}></Grid>
                  <Grid item xs={6}>
                    <Input
                      value={values.verifyComments}
                      InputComponent={FormTextField}
                      inputComponentProps={{
                        name: "verifyComments",
                        margin: "normal",
                        fullWidth: true,
                        placeholder: t("Comments"),
                      }}
                      onBlur={() => handleCommentsOnBlur(values.verifyComments)}
                    />
                  </Grid>
                  <Grid item xs={2}>
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
}));
