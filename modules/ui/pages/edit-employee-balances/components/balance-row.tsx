import * as React from "react";
import { useState, useMemo } from "react";
import { makeStyles } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import {
  AbsenceReasonTrackingTypeId,
  AbsenceReasonBalanceCreateInput,
  AbsenceReasonBalanceUpdateInput,
} from "graphql/server-types.gen";
import { TextButton } from "ui/components/text-button";
import clsx from "clsx";
import { Formik } from "formik";
import { SelectNew } from "ui/components/form/select-new";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { DatePicker } from "ui/components/form/date-picker";
import { parseISO, isBefore, isAfter } from "date-fns";
import { round } from "lodash-es";
import * as yup from "yup";
import { ConfirmNegativeBalance } from "./confirm-negative-balance";

type Props = {
  absenceReasonBalance: {
    id?: string;
    employeeId: string;
    schoolYearId: string;
    rowVersion?: string | null;
    absenceReason?: {
      id: string;
      name: string;
      absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
      allowNegativeBalance: boolean;
    } | null;
    initialBalance?: number;
    usedBalance?: number;
    plannedBalance?: number;
    unusedBalance?: number;
    balanceAsOf?: string;
  } | null;
  orgId: string;
  shadeRow: boolean;
  onRemove: (absenceReasonBalanceId: string) => Promise<void>;
  onUpdate: (
    absenceReasonBalance: AbsenceReasonBalanceUpdateInput
  ) => Promise<boolean>;
  onCreate: (
    absenceReasonBalance: AbsenceReasonBalanceCreateInput
  ) => Promise<boolean>;
  reasonOptions: { label: string; value: string }[];
  absenceReasons: {
    id: string;
    name: string;
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
    allowNegativeBalance?: boolean | null;
  }[];
  creatingNew: boolean;
  setCreatingNew: React.Dispatch<React.SetStateAction<boolean>>;
  startOfSchoolYear: string;
  endOfSchoolYear: string;
};

export const BalanceRow: React.FC<Props> = props => {
  const { t } = useTranslation();
  const classes = useStyles();

  const [overrideOpen, setOverrideOpen] = useState(false);
  const [changes, setChanges] = useState(false);

  const absenceReasonBalance = props.absenceReasonBalance;
  const [absenceReasonId, setAbsenceReasonId] = useState(
    absenceReasonBalance?.absenceReason?.id
  );

  const handleClickRemove = async () => {
    if (props.creatingNew) {
      props.setCreatingNew(false);
    } else {
      await props.onRemove(absenceReasonBalance?.id ?? "");
    }
  };

  const creatingNew = props.creatingNew;
  const absenceReasons = props.absenceReasons;

  const selectedReason = useMemo(
    () =>
      creatingNew
        ? absenceReasons.find(x => x.id === absenceReasonId)
        : absenceReasonBalance?.absenceReason,
    [absenceReasonBalance, absenceReasonId, absenceReasons, creatingNew]
  );

  const balanceTypeLabel = useMemo(
    () =>
      selectedReason
        ? selectedReason.absenceReasonTrackingTypeId ===
          AbsenceReasonTrackingTypeId.Daily
          ? t("Days")
          : t("Hours")
        : "",
    [selectedReason, t]
  );

  return (
    <Formik
      initialValues={{
        absenceReasonId: absenceReasonId,
        balance: absenceReasonBalance?.initialBalance ?? 0,
        asOf: absenceReasonBalance?.balanceAsOf
          ? parseISO(absenceReasonBalance?.balanceAsOf)
          : parseISO(props.startOfSchoolYear),
        ignoreWarnings: false,
      }}
      onSubmit={async data => {
        if (creatingNew) {
          if (
            data.balance - (absenceReasonBalance?.usedBalance ?? 0) < 0 &&
            !absenceReasons.find(x => x.id === data.absenceReasonId)
              ?.allowNegativeBalance &&
            !data.ignoreWarnings
          ) {
            setOverrideOpen(true);
          } else {
            setOverrideOpen(false);
            const result = await props.onCreate({
              orgId: props.orgId,
              employeeId: absenceReasonBalance?.employeeId,
              schoolYearId: absenceReasonBalance?.schoolYearId,
              absenceReasonId: data.absenceReasonId,
              initialBalance: data.balance,
              balanceAsOf: data.asOf,
              ignoreWarnings: data.ignoreWarnings,
            });
            if (result) setChanges(false);
          }
        } else {
          if (
            data.balance - (absenceReasonBalance?.usedBalance ?? 0) < 0 &&
            !absenceReasonBalance?.absenceReason?.allowNegativeBalance &&
            !data.ignoreWarnings
          ) {
            setOverrideOpen(true);
          } else {
            setOverrideOpen(false);
            const result = await props.onUpdate({
              id: absenceReasonBalance?.id ?? "",
              rowVersion: absenceReasonBalance?.rowVersion ?? "",
              schoolYearId: absenceReasonBalance?.schoolYearId,
              absenceReasonId: data.absenceReasonId,
              initialBalance: data.balance,
              balanceAsOf: data.asOf,
              ignoreWarnings: data.ignoreWarnings,
            });
            if (result) setChanges(false);
          }
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
          .required(t("Required")),
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
              {creatingNew ? (
                <SelectNew
                  name="absenceReasonId"
                  value={
                    props.reasonOptions.find(
                      e => e.value && e.value === values.absenceReasonId
                    ) ?? { label: "", value: "" }
                  }
                  multiple={false}
                  onChange={(value: any) => {
                    setAbsenceReasonId(value.value);
                    setFieldValue("absenceReasonId", value.value);
                    setChanges(true);
                  }}
                  options={props.reasonOptions}
                  withResetValue={false}
                  inputStatus={errors.absenceReasonId ? "error" : "default"}
                />
              ) : (
                absenceReasonBalance?.absenceReason?.name
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
                    onChange={e => {
                      setFieldValue("balance", e.target.value);
                      setChanges(true);
                    }}
                  />
                }
              </div>
              <div>{balanceTypeLabel}</div>
            </div>
            <div className={classes.asOfContainer}>
              {
                <DatePicker
                  variant={"single-hidden"}
                  startDate={values.asOf}
                  onChange={async ({ startDate }) => {
                    setFieldValue("asOf", startDate);
                    setChanges(true);
                  }}
                  inputStatus={errors.asOf ? "error" : undefined}
                  validationMessage={errors.asOf}
                />
              }
            </div>
            <div className={classes.valueContainer}>
              {absenceReasonBalance?.usedBalance != undefined &&
              absenceReasonBalance?.plannedBalance != undefined
                ? round(
                    absenceReasonBalance?.usedBalance -
                      absenceReasonBalance?.plannedBalance,
                    1
                  )
                : 0}
            </div>
            <div className={classes.valueContainer}>
              {absenceReasonBalance?.plannedBalance != undefined
                ? round(absenceReasonBalance?.plannedBalance, 1)
                : 0}
            </div>
            <div className={classes.valueContainer}>
              {absenceReasonBalance?.unusedBalance != undefined
                ? round(absenceReasonBalance?.unusedBalance, 1)
                : values.balance}
            </div>
            <div className={classes.buttonContainer}>
              {changes && (
                <div className={classes.button}>
                  <TextButton onClick={() => handleSubmit()}>
                    {t("Save")}
                  </TextButton>
                </div>
              )}
              <div className={classes.button}>
                <TextButton onClick={() => handleClickRemove()}>
                  {t("Remove")}
                </TextButton>
              </div>
            </div>
          </div>
          <ConfirmNegativeBalance
            open={overrideOpen}
            onCancel={() => setOverrideOpen(false)}
            onConfirm={async () => {
              setFieldValue("ignoreWarnings", true);
              await submitForm();
            }}
            reasonName={selectedReason?.name ?? ""}
          />
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
  button: {
    padding: theme.spacing(0.5),
  },
  buttonContainer: {
    paddingLeft: theme.spacing(4),
    display: "column",
    alignItems: "center",
    justifyItems: "center",
  },
}));
