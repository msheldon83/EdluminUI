import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useAllSchoolYears } from "reference-data/school-years";
import { isBefore, isAfter, parseISO } from "date-fns";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";

type Props = {
  orgId: string;
  startDate: Date;
  employeeId: string;
  usages: AbsenceReasonUsageData[] | null;
  actingAsEmployee: boolean;
  setNegativeBalanceWarning: React.Dispatch<React.SetStateAction<boolean>>;
};

export type AbsenceReasonUsageData = {
  amount: number;
  absenceReasonTrackingTypeId?: "INVALID" | "HOURLY" | "DAILY" | null;
  absenceReasonId: string;
};

export const BalanceUsage: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();

  const usages = props.usages;
  const actingAsEmployee = props.actingAsEmployee;

  const allSchoolYears = useAllSchoolYears(props.orgId);
  const schoolYearId = allSchoolYears.find(
    x =>
      isAfter(props.startDate, parseISO(x.startDate)) &&
      isBefore(props.startDate, parseISO(x.endDate))
  )?.id;

  const getAbsenceReasonBalances = useQueryBundle(GetAbsenceReasonBalances, {
    variables: {
      employeeId: props.employeeId,
      schoolYearId: schoolYearId,
    },
    skip: !schoolYearId,
  });

  const employeeBalances = useMemo(() => {
    if (
      getAbsenceReasonBalances.state === "DONE" &&
      getAbsenceReasonBalances.data?.absenceReasonBalance
    ) {
      return (
        compact(
          getAbsenceReasonBalances.data.absenceReasonBalance.byEmployeeId
        ) ?? []
      );
    }
    return [];
  }, [getAbsenceReasonBalances]);

  const usageAmount = useMemo(() => {
    if (!usages || usages.length < 1) return null;

    const balance = employeeBalances.find(
      x => x.absenceReason?.id === usages[0].absenceReasonId
    );
    if (!balance) return null;

    const trackingType = usages[0].absenceReasonTrackingTypeId;
    const amount = usages.reduce((m, v) => m + v.amount, 0);
    const negativeWarning =
      balance.usedBalance + amount > balance.initialBalance &&
      !balance.absenceReason?.allowNegativeBalance;
    return { trackingType, amount, negativeWarning };
  }, [usages, employeeBalances]);

  const balanceUsageText = useMemo(() => {
    if (!usageAmount || !usageAmount.trackingType) return null;

    const { trackingType, amount } = usageAmount;
    const unitText = {
      INVALID: null,
      DAILY: ["day", "days"],
      HOURLY: ["hour", "hours"],
    }[trackingType];
    if (!unitText) return null;
    return `${t("Uses")} ${amount.toFixed(2)} ${t(
      unitText[Number(amount !== 1)]
    )} ${t("of")} ${actingAsEmployee ? t("your") : t("employee's")} ${t(
      "balance"
    )}`;
  }, [usageAmount, t, actingAsEmployee]);

  // If the balance goes negative and the user is an employee, set the warning state
  const setNegativeBalanceWarning = props.setNegativeBalanceWarning;
  useEffect(() => {
    if (usageAmount?.negativeWarning) {
      setNegativeBalanceWarning(actingAsEmployee);
    }
  }, [usageAmount, setNegativeBalanceWarning, actingAsEmployee]);

  return balanceUsageText ? (
    <>
      <div className={classes.usageTextContainer}>
        <InfoIcon color="primary" />
        <div className={classes.usageText}>{balanceUsageText}</div>
      </div>
      {usageAmount?.negativeWarning && (
        <div className={classes.warningText}>
          {t("This will result in a negative balance.")}
        </div>
      )}
    </>
  ) : (
    <></>
  );
};

const useStyles = makeStyles(theme => ({
  usageTextContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    margin: `${theme.spacing(2)}px 0`,
  },
  usageText: {
    marginLeft: theme.spacing(1),
  },
  warningText: {
    color: theme.customColors.darkRed,
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(14),
  },
}));
