import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useAllSchoolYears } from "reference-data/school-years";
import { isBefore, isAfter, parseISO } from "date-fns";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact, round } from "lodash-es";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  startDate: Date;
  employeeId: string;
  usages: AbsenceReasonUsageData[] | null;
  actingAsEmployee?: boolean;
  setNegativeBalanceWarning: React.Dispatch<React.SetStateAction<boolean>>;
};

export type AbsenceReasonUsageData = {
  hourlyAmount: number;
  dailyAmount: number;
  absenceReasonId: string;
  absenceReason?: { absenceReasonCategoryId?: string | null } | null;
};

type usageAmountData = {
  name: string;
  trackingType: AbsenceReasonTrackingTypeId;
  amount: number;
  negativeWarning: boolean;
  remainingBalance: number;
} | null;

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

  const balance = useMemo(() => {
    return usages && usages.length > 0
      ? employeeBalances.find(
          x =>
            x.absenceReason?.id === usages[0].absenceReasonId ||
            (x.absenceReasonCategoryId &&
              x.absenceReasonCategoryId ===
                usages[0].absenceReason?.absenceReasonCategoryId)
        )
      : null;
  }, [employeeBalances, usages]);

  const usageAmount: usageAmountData = useMemo(() => {
    if (!usages || usages.length < 1 || !balance) return null;

    const name = balance.absenceReasonId
      ? balance.absenceReason?.name ?? ""
      : balance.absenceReasonCategory?.name ?? "";
    const trackingType = balance.absenceReasonTrackingTypeId;
    const amount = usages.reduce((m, v) => {
      const a =
        trackingType === AbsenceReasonTrackingTypeId.Hourly
          ? v.hourlyAmount
          : v.dailyAmount;
      return m + a;
    }, 0);

    const balanceIsNegative =
      (balance.usedBalance as number) + amount > balance.initialBalance;
    const reasonAllowsNegatives =
      balance.absenceReason?.allowNegativeBalance ?? false;
    const categoryAllowsNegatives =
      balance.absenceReasonCategory?.allowNegativeBalance ?? false;
    let negativeWarning = balanceIsNegative;
    if (negativeWarning && balance.absenceReasonId)
      negativeWarning = !reasonAllowsNegatives;
    if (negativeWarning && balance.absenceReasonCategoryId)
      negativeWarning = !categoryAllowsNegatives;

    const remainingBalance = balance.netBalance - amount;
    return { name, trackingType, amount, negativeWarning, remainingBalance };
  }, [balance, usages]);

  const calculateBalanceUsageText = React.useCallback(
    (usageAmount: usageAmountData) => {
      if (!usageAmount || !usageAmount.trackingType) return null;
      const { name, trackingType, amount, remainingBalance } = usageAmount;
      const unitText = {
        INVALID: null,
        DAILY: ["day", "days"],
        HOURLY: ["hour", "hours"],
      }[trackingType];

      if (!unitText) return null;
      return `${t("Uses")} ${round(amount, 2)} ${t(
        unitText[Number(amount !== 1)]
      )} ${t("of")} ${
        actingAsEmployee ? t("your") : t("employee's")
      } ${name} ${t("balance leaving")} ${round(remainingBalance, 2)} ${t(
        unitText[Number(remainingBalance !== 1)]
      )}`;
    },
    [t, actingAsEmployee]
  );

  // If the balance goes negative and the user is an employee, set the warning state
  const setNegativeBalanceWarning = props.setNegativeBalanceWarning;
  useEffect(() => {
    if (usageAmount?.negativeWarning) {
      setNegativeBalanceWarning(actingAsEmployee ?? false);
    } else {
      setNegativeBalanceWarning(false);
    }
  }, [usageAmount, setNegativeBalanceWarning, actingAsEmployee]);

  return (
    <>
      {usageAmount && (
        <>
          <div className={classes.usageTextContainer}>
            <InfoIcon color="primary" />
            <div className={classes.usageText}>
              {calculateBalanceUsageText(usageAmount)}
            </div>
          </div>
          {usageAmount?.negativeWarning && (
            <div className={classes.warningText}>
              {t("This will result in a negative balance.")}
            </div>
          )}
        </>
      )}
    </>
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
