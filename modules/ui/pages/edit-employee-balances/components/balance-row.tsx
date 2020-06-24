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
import { SelectNew, OptionType } from "ui/components/form/select-new";
import { Input } from "ui/components/form/input";
import { TextField as FormTextField } from "ui/components/form/text-field";
import { EmployeeBalanceReportLink } from "ui/components/links/reports";
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
    absenceReasonTrackingTypeId?: AbsenceReasonTrackingTypeId | null;
    absenceReason?: {
      id: string;
      name: string;
      allowNegativeBalance: boolean;
    } | null;
    absenceReasonCategory?: {
      id: string;
      name: string;
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
  absenceReasonTrackingTypeId: AbsenceReasonTrackingTypeId;
  absenceReasonTrackingTypeOptions: { label: string; value: string }[];
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
    allowNegativeBalance?: boolean | null;
  }[];
  absenceReasonCategories: {
    id: string;
    name: string;
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
  const [absenceReasonCategoryId, setAbsenceReasonCategoryId] = useState(
    absenceReasonBalance?.absenceReasonCategory?.id
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
  const absenceReasonCategories = props.absenceReasonCategories;

  const selectedReason = useMemo(
    () =>
      creatingNew
        ? absenceReasonId
          ? absenceReasons.find(x => x.id === absenceReasonId)
          : absenceReasonCategories.find(x => x.id === absenceReasonCategoryId)
        : absenceReasonId
        ? absenceReasonBalance?.absenceReason
        : absenceReasonBalance?.absenceReasonCategory,
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    [
      absenceReasonBalance,
      absenceReasonId,
      absenceReasonCategoryId,
      absenceReasons,
      absenceReasonCategories,
      creatingNew,
    ]
  );

  return (
    <Formik
      initialValues={{
        absenceReasonId: absenceReasonId,
        absenceReasonCategoryId: absenceReasonCategoryId,
        absenceReasonTrackingTypeId:
          absenceReasonBalance?.absenceReasonTrackingTypeId ??
          AbsenceReasonTrackingTypeId.Hourly,
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
            !selectedReason?.allowNegativeBalance &&
            !data.ignoreWarnings
          ) {
            setOverrideOpen(true);
          } else {
            setOverrideOpen(false);
            const result = await props.onCreate({
              orgId: props.orgId,
              employeeId: absenceReasonBalance?.employeeId,
              schoolYearId: absenceReasonBalance?.schoolYearId,
              absenceReasonId: data.absenceReasonId ?? null,
              absenceReasonTrackingTypeId:
                data.absenceReasonTrackingTypeId ?? null,
              absenceReasonCategoryId: data.absenceReasonCategoryId ?? null,
              initialBalance: data.balance,
              balanceAsOf: data.asOf,
              ignoreWarnings: data.ignoreWarnings,
            });
            if (result) setChanges(false);
          }
        } else {
          if (
            data.balance - (absenceReasonBalance?.usedBalance ?? 0) < 0 &&
            !selectedReason?.allowNegativeBalance &&
            !data.ignoreWarnings
          ) {
            setOverrideOpen(true);
          } else {
            setOverrideOpen(false);
            const result = await props.onUpdate({
              id: absenceReasonBalance?.id ?? "",
              rowVersion: absenceReasonBalance?.rowVersion ?? "",
              schoolYearId: absenceReasonBalance?.schoolYearId,
              absenceReasonTrackingTypeId:
                data.absenceReasonTrackingTypeId ?? null,
              absenceReasonId: data.absenceReasonId ?? null,
              absenceReasonCategoryId: data.absenceReasonCategoryId ?? null,
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
          .test("reasonSelected", t("A reason must be selected"), function(
            value
          ) {
            if (!value && !absenceReasonCategoryId) {
              return this.createError({
                message: t("A reason must be selected"),
              });
            }
            return true;
          }),
        balance: yup
          .number()
          .nullable()
          .required(t("Required")),
        absenceReasonTrackingTypeId: yup
          .string()
          .nullable()
          .test("typeSelected", t("A type must be selected"), function(value) {
            if (!value) {
              return this.createError({
                message: t("A type must be selected"),
              });
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
                    values.absenceReasonId
                      ? props.reasonOptions.find(
                          e => e.value && e.value === values.absenceReasonId
                        ) ?? { label: "", value: "" }
                      : values.absenceReasonCategoryId
                      ? props.reasonOptions.find(
                          e =>
                            e.value &&
                            e.value === values.absenceReasonCategoryId
                        ) ?? { label: "", value: "" }
                      : { label: "", value: "" }
                  }
                  multiple={false}
                  onChange={(value: any) => {
                    if (value.label.includes("Category: ")) {
                      setAbsenceReasonCategoryId(value.value);
                      setFieldValue("absenceReasonCategoryId", value.value);
                    } else {
                      setAbsenceReasonId(value.value);
                      setFieldValue("absenceReasonId", value.value);
                    }

                    setChanges(true);
                  }}
                  options={props.reasonOptions}
                  withResetValue={false}
                  inputStatus={errors.absenceReasonId ? "error" : "default"}
                />
              ) : absenceReasonId ? (
                <EmployeeBalanceReportLink
                  orgId={props.orgId}
                  employeeId={absenceReasonBalance?.employeeId}
                  reasonId={absenceReasonId}
                >
                  {absenceReasonBalance?.absenceReason?.name}
                </EmployeeBalanceReportLink>
              ) : (
                `Category: ${absenceReasonBalance?.absenceReasonCategory?.name}`
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
              <div className={classes.balanceType}>
                <SelectNew
                  name="absenceReasonTrackingTypeId"
                  value={
                    props.absenceReasonTrackingTypeOptions.find(
                      e =>
                        e.value &&
                        e.value === values.absenceReasonTrackingTypeId
                    ) ??
                    props.absenceReasonTrackingTypeOptions.find(
                      e =>
                        e.value && e.value === props.absenceReasonTrackingTypeId
                    )
                  }
                  multiple={false}
                  onChange={(value: any) => {
                    setFieldValue("absenceReasonTrackingTypeId", value.value);

                    setChanges(true);
                  }}
                  options={props.absenceReasonTrackingTypeOptions}
                  withResetValue={false}
                  inputStatus={
                    errors.absenceReasonTrackingTypeId ? "error" : "default"
                  }
                />
              </div>
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
                    2
                  )
                : 0}
            </div>
            <div className={classes.valueContainer}>
              {absenceReasonBalance?.plannedBalance != undefined
                ? round(absenceReasonBalance?.plannedBalance, 2)
                : 0}
            </div>
            <div className={classes.valueContainer}>
              {absenceReasonBalance?.usedBalance != undefined &&
              absenceReasonBalance?.initialBalance != undefined
                ? round(
                    absenceReasonBalance?.initialBalance -
                      absenceReasonBalance?.usedBalance,
                    2
                  )
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
    backgroundColor: "#F5F5F5",
  },
  text: {
    fontSize: theme.typography.pxToRem(14),
    color: "#9E9E9E",
  },
  reasonContainer: {
    width: theme.typography.pxToRem(240),
    paddingLeft: theme.spacing(1),
  },
  balanceInput: {
    width: theme.typography.pxToRem(80),
    padding: theme.spacing(2),
  },
  balanceType: {
    width: theme.typography.pxToRem(120),
  },
  balanceValueContainer: {
    width: theme.typography.pxToRem(200),
    display: "flex",
    alignItems: "center",
  },
  asOfContainer: {
    width: theme.typography.pxToRem(140),
    margin: theme.spacing(1, 2, 0, 2),
  },
  valueContainer: {
    width: theme.typography.pxToRem(120),
    paddingLeft: theme.spacing(6),
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
