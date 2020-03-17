import * as React from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import { Formik } from "formik";
import { OptionType, SelectNew } from "ui/components/form/select-new";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { DatePicker } from "ui/components/form/date-picker";
import { parseISO, isBefore, isAfter } from "date-fns";
import { round } from "lodash-es";
import * as yup from "yup";

type Props = {
  absenceReason?: {
    id?: string;
    name?: string;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
  } | null;
  initialBalance?: number;
  usedBalance?: number;
  plannedBalance?: number;
  remainingBalance?: number;
  balanceAsOf?: string;
  shadeRow: boolean;
  onRemove: (absenceReasonId: string) => Promise<void>;
  onUpdate: (
    absenceReasonId: string,
    balance: number,
    asOf: Date
  ) => Promise<void>;
  reasonOptions: { label: string; value: string }[];
  absenceReasons: {
    id: string;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
  }[];
  creatingNew: boolean;
  setCreatingNew: React.Dispatch<React.SetStateAction<boolean>>;
  startOfSchoolYear: string;
  endOfSchoolYear: string;
};

export const BalanceRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const balanceTrackingType =
    props.absenceReason?.absenceReasonTrackingTypeId ===
    AbsenceReasonTrackingTypeId.Daily
      ? t("Days")
      : t("Hours");

  const handleClickRemove = async () => {
    if (props.creatingNew) {
      props.setCreatingNew(false);
    } else {
      await props.onRemove(props.absenceReason?.id ?? "");
    }
  };

  const determineBalanceTypeLabel = (absenceReasonId?: string) => {
    const selectedReason = props.creatingNew
      ? props.absenceReasons.find(x => x.id === absenceReasonId)
      : props.absenceReason;

    return selectedReason
      ? selectedReason.absenceReasonTrackingTypeId ===
        AbsenceReasonTrackingTypeId.Daily
        ? t("Days")
        : t("Hours")
      : "";
  };

  return (
    <Formik
      initialValues={{
        absenceReasonId: props.absenceReason?.id,
        balance: props.initialBalance ?? 0,
        asOf: props.balanceAsOf
          ? parseISO(props.balanceAsOf)
          : parseISO(props.startOfSchoolYear),
      }}
      onSubmit={async data => {
        if (data.absenceReasonId && data.balance > 0) {
          await props.onUpdate(data.absenceReasonId, data.balance, data.asOf);
        }
      }}
      validationSchema={yup.object({
        absenceReasonId: yup
          .string()
          .nullable()
          .required(t("A reason must be selected")),
        balance: yup
          .number()
          .nullable()
          .required(t("An initial balance is required"))
          .test("balanceGreaterThanZero", t("Required"), function(value) {
            if (value <= 0) {
              return this.createError({});
            }
            return true;
          }),
        asOf: yup
          .date()
          .nullable()
          .required(t("As of date is required"))
          .test("dateInSchool", t("Date must be in school year"), function(
            value
          ) {
            if (
              isBefore(value, parseISO(props.startOfSchoolYear)) ||
              isAfter(value, parseISO(props.endOfSchoolYear))
            ) {
              console.log(value);
              return this.createError({
                message: t("Must be in school year"),
              });
            }
            return true;
          }),
      })}
    >
      {({
        values,
        handleSubmit,
        submitForm,
        setFieldValue,
        errors,
        handleBlur,
      }) => (
        <form onSubmit={handleSubmit}>
          <div
            className={clsx({
              [classes.container]: true,
              [classes.shadedRow]: props.shadeRow,
            })}
          >
            <div className={classes.reasonContainer}>
              {props.creatingNew ? (
                <SelectNew
                  name="absenceReasonId"
                  value={
                    props.reasonOptions.find(
                      e => e.value && e.value === values.absenceReasonId
                    ) ?? { label: "", value: "" }
                  }
                  multiple={false}
                  onChange={(value: any) => {
                    setFieldValue("absenceReasonId", value.value);
                  }}
                  onBlur={() => submitForm()}
                  options={props.reasonOptions}
                  withResetValue={false}
                  inputStatus={errors.absenceReasonId ? "error" : "default"}
                />
              ) : (
                props.absenceReason?.name
              )}
            </div>
            <div className={classes.balanceValueContainer}>
              <div className={classes.balanceInput}>
                {
                  <Input
                    value={values.balance}
                    InputComponent={FormTextField}
                    inputComponentProps={{
                      name: "balance",
                      id: "balance",
                    }}
                    onBlur={() => submitForm()}
                  />
                }
              </div>
              <div>{determineBalanceTypeLabel(values.absenceReasonId)}</div>
            </div>
            <div className={classes.asOfContainer}>
              {
                <DatePicker
                  variant={"single-hidden"}
                  startDate={values.asOf}
                  onChange={({ startDate }) => {
                    setFieldValue("asOf", startDate);
                    submitForm();
                  }}
                  inputStatus={errors.asOf ? "error" : undefined}
                  validationMessage={errors.asOf}
                />
              }
            </div>
            <div className={classes.valueContainer}>
              {props.usedBalance ? round(props.usedBalance, 1) : 0}
            </div>
            <div className={classes.valueContainer}>
              {props.plannedBalance ? round(props.plannedBalance, 1) : 0}
            </div>
            <div className={classes.valueContainer}>
              {props.remainingBalance
                ? round(props.remainingBalance, 1)
                : values.balance}
            </div>
            <div className={classes.removeButton}>
              <TextButton onClick={() => handleClickRemove()}>
                {t("Remove")}
              </TextButton>
            </div>
          </div>
        </form>
      )}
    </Formik>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    width: "100%",
    display: "flex",
    alignItems: "center",
  },
  shadedRow: {
    //border: "1px solid #F5F5F5",
    backgroundColor: "#F5F5F5",
  },
  text: {
    fontSize: theme.typography.pxToRem(14),
    color: "#9E9E9E",
  },
  reasonContainer: {
    width: theme.typography.pxToRem(270),
    padding: theme.spacing(2),
  },
  balanceInput: {
    width: theme.typography.pxToRem(70),
    padding: theme.spacing(1),
  },
  balanceValueContainer: {
    width: theme.typography.pxToRem(150),
    display: "flex",
    alignItems: "center",
  },
  asOfContainer: {
    width: theme.typography.pxToRem(140),
    margin: theme.spacing(1, 4, 0, 4),
  },
  valueContainer: {
    width: theme.typography.pxToRem(100),
    paddingLeft: theme.spacing(3),
  },
  removeButton: {
    paddingLeft: theme.spacing(4),
  },
}));
