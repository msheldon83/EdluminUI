import * as React from "react";
import { useMemo } from "react";
import {
  Grid,
  Button,
  Typography,
  makeStyles,
  Card,
  CardContent,
} from "@material-ui/core";
import {
  VacancyDetail,
  VacancyDetailVerifyInput,
} from "graphql/server-types.gen";
import { useTranslation } from "react-i18next";
import { useAccountingCodes } from "reference-data/accounting-codes";
import { parseISO, format, isEqual } from "date-fns";
import clsx from "clsx";
import * as yup from "yup";
import { Input } from "ui/components/form/input";
import { Select, SelectValueType, OptionType } from "ui/components/form/select";
import { useForm } from "forms";

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
    | "accountingCodeAllocations"
    | "verifyComments"
    | "verifiedAtLocal"
  >;
  shadeRow: boolean;
  onVerify: (verifyInput: VacancyDetailVerifyInput) => Promise<void>;
  setSelectedVacancyDetail: React.Dispatch<
    React.SetStateAction<string | undefined>
  >;
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

  const parseDayPortion = (dayPortion: number) => {
    if (dayPortion < 0.5) {
      return t("Partial Day(Hourly)");
    } else if (dayPortion === 0.5) {
      return t("Half Day");
    } else if (dayPortion > 0.5 && dayPortion < 2) {
      return t("Full Day");
    } else {
      return t("Full Days");
    }
  };

  const isActiveCard = props.selectedVacancyDetail
    ? vacancyDetail.id === props.selectedVacancyDetail
    : false;

  const initialFormData: VerifyVacancyDetailFormData = {
    verifyComments: vacancyDetail.verifyComments ?? undefined,
    payCode: vacancyDetail.payCode?.id ?? undefined,
    dayPortion: vacancyDetail.dayPortion,
  };

  const {
    register,
    handleSubmit,
    setValue,
    formState,
    getValues,
    errors,
    triggerValidation,
  } = useForm<VerifyVacancyDetailFormData>({
    defaultValues: initialFormData,
  });

  register({ name: "payCode", type: "custom" });
  register({ name: "accountingCode", type: "custom" });
  register({ name: "verifyComments", type: "custom" });
  const formValues = getValues();

  const onPayCodeChange = React.useCallback(
    async event => {
      await setValue("payCode", event?.value);
      await triggerValidation({ name: "payCode" });
    },
    [setValue, triggerValidation]
  );

  const onAccountingCodeChange = React.useCallback(
    async event => {
      await setValue("accountingCode", event?.value);
      await triggerValidation({ name: "accountingCode" });
    },
    [setValue, triggerValidation]
  );

  const onVerifyCommentsChange = React.useCallback(
    async event => {
      await setValue("verifyComments", event.target.value);
    },
    [setValue]
  );

  return (
    <div onClick={() => props.setSelectedVacancyDetail(vacancyDetail.id)}>
      <form
        onSubmit={handleSubmit(async (data, e) => {
          await props.onVerify({
            vacancyDetailId: vacancyDetail.id,
            payCodeId: Number(formValues.payCode),
            verifyComments: formValues.verifyComments,
            accountingCodeAllocations: formValues.accountingCode
              ? [
                  {
                    accountingCodeId: Number(formValues.accountingCode),
                    allocation: 1.0,
                  },
                ]
              : [],
            doVerify: notVerified,
          });
        })}
      >
        <Card
          classes={{
            root: clsx({
              [classes.cardRoot]: true,
              [classes.cardSelection]:
                !isActiveCard || !props.selectedVacancyDetail,
            }),
          }}
        >
          <CardContent
            classes={{
              root: classes.cardContentRoot,
            }}
          >
            <Grid
              container
              justify="space-between"
              alignItems="center"
              spacing={2}
              className={props.shadeRow ? classes.shadedRow : undefined}
            >
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {`${t("Absence")} #${vacancyDetail.vacancy!.absence!.id}`}
                </Typography>
                <Typography variant="h6">{`${t("Assignment")} #C${
                  vacancyDetail.assignment!.id
                }`}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {`${vacancyDetail.vacancy!.absence!.employee!.firstName} ${
                    vacancyDetail.vacancy!.absence!.employee!.lastName
                  }`}
                </Typography>
                <Typography variant="h6">{`${
                  vacancyDetail.assignment!.employee!.firstName
                } ${vacancyDetail.assignment!.employee!.lastName}`}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {`${parseDayPortion(absenceDetail?.dayPortion)} (${format(
                    absenceDetailStartTime,
                    "h:mmaaa"
                  )}-${format(absenceDetailEndTime, "h:mmaaa")})`}
                </Typography>
                <Typography variant="h6">{`${format(
                  vacancyDetailStartTime,
                  "h:mm aaa"
                )} - ${format(vacancyDetailEndTime, "h:mm aaa")}`}</Typography>
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {vacancyDetail.vacancy!.position!.name}
                </Typography>
                {isActiveCard ? (
                  <Select
                    value={{
                      value: formValues.payCode,
                      label:
                        props.payCodeOptions.find(
                          a => a.value === formValues.payCode
                        )?.label || "",
                    }}
                    onChange={onPayCodeChange}
                    options={props.payCodeOptions}
                    isClearable={!!formValues.payCode}
                    inputStatus={errors.payCode ? "error" : undefined}
                    validationMessage={errors.payCode?.message}
                  />
                ) : (
                  <Typography variant="h6">{`Pay: ${vacancyDetail.payCode
                    ?.name ?? t("N/A")}`}</Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                <Typography className={classes.lightText}>
                  {vacancyDetail.location!.name}
                </Typography>
                {isActiveCard ? (
                  <Select
                    value={{
                      value: formValues.accountingCode,
                      label:
                        accountingCodeOptions.find(
                          a => a.value === formValues.accountingCode
                        )?.label || "",
                    }}
                    onChange={onAccountingCodeChange}
                    options={accountingCodeOptions}
                    isClearable={!!formValues.accountingCode}
                    inputStatus={errors.accountingCode ? "error" : undefined}
                    validationMessage={errors.accountingCode?.message}
                  />
                ) : (
                  <Typography variant="h6">{`Acct: ${vacancyDetail.accountingCodeAllocations![0]
                    ?.accountingCode?.name ?? t("N/A")}`}</Typography>
                )}
              </Grid>
              <Grid item xs={2}>
                <Button variant="outlined" type="submit">
                  {notVerified ? t("Verify") : t("Undo verify")}
                </Button>
              </Grid>
            </Grid>
            {isActiveCard && (
              <Grid
                container
                justify="flex-end"
                alignItems="center"
                spacing={2}
              >
                <Grid item></Grid>
                <Grid item xs={6}>
                  <Input
                    value={formValues.verifyComments}
                    inputComponentProps={{
                      name: "verifyComments",
                      margin: "normal",
                      fullWidth: true,
                      placeholder: t("Comments"),
                    }}
                    onChange={onVerifyCommentsChange}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export const useStyles = makeStyles(theme => ({
  root: {
    width: 500,
  },
  typography: {
    padding: theme.spacing(2),
  },
  paper: {
    border: "1px solid",
    padding: theme.spacing(1),
    backgroundColor: theme.palette.background.paper,
  },

  lightText: {
    fontSize: theme.typography.fontSize,
  },
  locationText: {
    fontSize: theme.typography.fontSize + 4,
  },
  boldText: {
    fontSize: theme.typography.fontSize,
    fontWeight: "bold",
  },
  shadedRow: {
    background: theme.customColors.lightGray,
  },

  cardRoot: {},
  cardSelection: {
    cursor: "pointer",
    "&:hover": {
      boxShadow:
        "0px 9px 18px rgba(0, 0, 0, 0.18), 0px 6px 5px rgba(0, 0, 0, 0.24)",
      opacity: 1,
    },
  },
  inactiveCard: {
    opacity: 0.5,
  },
  cardContentRoot: {
    padding: "0 !important",
  },
  cardContent: {
    padding: theme.spacing(2),
  },
}));

export type VerifyVacancyDetailFormData = {
  accountingCode?: string;
  payCode?: string;
  dayPortion?: number;
  verifyComments?: string;
};
