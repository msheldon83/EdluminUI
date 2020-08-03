import * as React from "react";
import { useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { makeStyles } from "@material-ui/core";
import InfoIcon from "@material-ui/icons/Info";
import { useAllSchoolYears } from "reference-data/school-years";
import { isBefore, isAfter, parseISO } from "date-fns";
import { GetAbsenceReasonBalances } from "ui/pages/employee-pto-balances/graphql/get-absencereasonbalances.gen";
import { useQueryBundle } from "graphql/hooks";
import { compact, round, sortBy } from "lodash-es";
import { AbsenceReasonTrackingTypeId } from "graphql/server-types.gen";

type Props = {
  orgId: string;
  startDate: Date;
  employeeId: string;
  usages: AbsenceReasonUsageData[] | null;
  actingAsEmployee?: boolean;
  setNegativeBalanceWarning: React.Dispatch<React.SetStateAction<boolean>>;
  initialUsageData?: AbsenceReasonUsageData[];
};

export type AbsenceReasonUsageData = {
  hourlyAmount: number;
  dailyAmount: number;
  absenceReasonId: string;
  absenceReason?: { absenceReasonCategoryId?: string | null } | null;
};

type UsageAmountData = {
  name: string;
  trackingType: AbsenceReasonTrackingTypeId;
  amount: number;
  negativeWarning: boolean;
  remainingBalance: number;
  absenceReasonId: string | null | undefined;
  absenceReasonCategoryId: string | null | undefined;
};

export const BalanceUsage: React.FC<Props> = props => {
  const classes = useStyles();
  const { t } = useTranslation();
  const { orgId, employeeId, usages, actingAsEmployee, startDate, initialUsageData } = props;

  const allSchoolYears = useAllSchoolYears(orgId);
  const schoolYearId = allSchoolYears.find(
    x =>
      isAfter(startDate, parseISO(x.startDate)) &&
      isBefore(startDate, parseISO(x.endDate))
  )?.id;

  const getAbsenceReasonBalances = useQueryBundle(GetAbsenceReasonBalances, {
    variables: {
      employeeId: employeeId,
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

  const allUsageAbsenceReasonIds = useMemo(
    () => (usages ? compact(usages.map(u => u.absenceReasonId)) : []),
    [usages]
  );
  const allUsageAbsenceReasonCategoryIds = useMemo(
    () =>
      usages
        ? compact(usages.map(u => u.absenceReason?.absenceReasonCategoryId))
        : [],
    [usages]
  );

  const balances = useMemo(() => {
    return usages && usages.length > 0
      ? employeeBalances.filter(
          x =>
            (x.absenceReasonId &&
              allUsageAbsenceReasonIds.includes(x.absenceReasonId)) ||
            (x.absenceReasonCategoryId &&
              allUsageAbsenceReasonCategoryIds.includes(
                x.absenceReasonCategoryId
              ))
        )
      : null;
  }, [
    allUsageAbsenceReasonCategoryIds,
    allUsageAbsenceReasonIds,
    employeeBalances,
    usages,
  ]);

  const usageAmounts: UsageAmountData[] = useMemo(() => {
    if (!usages || !balances) {
      return [];
    }

    const calculatedUsages = usages.reduce(
      (accumulator: UsageAmountData[], u: AbsenceReasonUsageData) => {
        const balance = balances.find(
          b =>
            (b.absenceReasonId && b.absenceReasonId === u.absenceReasonId) ||
            (b.absenceReasonCategoryId &&
              b.absenceReasonCategoryId ===
                u.absenceReason?.absenceReasonCategoryId)
        );
        if (!balance) {
          return accumulator;
        }

        const match = accumulator.find(
          a =>
            (a.absenceReasonId &&
              a.absenceReasonId === balance.absenceReasonId) ||
            (a.absenceReasonCategoryId &&
              a.absenceReasonCategoryId === balance.absenceReasonCategoryId)
        );
        const amount =
          balance.absenceReasonTrackingTypeId ===
          AbsenceReasonTrackingTypeId.Hourly
            ? u.hourlyAmount
            : u.dailyAmount;
        const totalAmount = (match?.amount ?? 0) + amount;
        const balanceIsNegative =
          (balance.usedBalance as number) + totalAmount >
          balance.initialBalance;
        const negativeBalanceAllowed =
          (balance.absenceReasonId
            ? balance.absenceReason?.allowNegativeBalance
            : balance.absenceReasonCategory?.allowNegativeBalance) ?? false;

        if (match) {
          match.amount = totalAmount;
          match.remainingBalance = match.remainingBalance - amount;
          match.negativeWarning = balanceIsNegative && !negativeBalanceAllowed;
        } else {
          const name = balance.absenceReasonId
            ? balance.absenceReason?.name ?? ""
            : balance.absenceReasonCategory?.name ?? "";

          accumulator.push({
            name: name,
            trackingType: balance.absenceReasonTrackingTypeId,
            amount: amount,
            negativeWarning: balanceIsNegative && !negativeBalanceAllowed,
            remainingBalance: balance.netBalance - amount,
            absenceReasonId: balance.absenceReasonId,
            absenceReasonCategoryId: balance.absenceReasonCategoryId,
          });
        }
        return accumulator;
      },
      []
    );

    return sortBy(compact(calculatedUsages), u => u.name);
  }, [balances, usages]);

  const getUsedAndRemainingText = React.useCallback(
    (usageAmount: UsageAmountData) => {
      if (!usageAmount || !usageAmount.trackingType) return null;
      const { trackingType, amount, remainingBalance } = usageAmount;
      const unitText = {
        INVALID: null,
        DAILY: [t("day"), t("days")],
        HOURLY: [t("hour"), t("hours")],
      }[trackingType];

      if (!unitText) return null;
      const usedText = `${round(amount, 2)} ${t(
        unitText[Number(amount !== 1)]
      )}`;
      const remainingText = `${round(remainingBalance, 2)} ${t(
        unitText[Number(remainingBalance !== 1)]
      )}`;
      return [usedText, remainingText];
    },
    [t]
  );

  // If the balance goes negative and the user is an employee, set the warning state
  // so they are prevented from saving the Absence until they get rid of the warning
  const setNegativeBalanceWarning = props.setNegativeBalanceWarning;
  useEffect(() => {
    if (usageAmounts.find(u => u?.negativeWarning)) {
      setNegativeBalanceWarning(actingAsEmployee ?? false);
    } else {
      setNegativeBalanceWarning(false);
    }
  }, [usageAmounts, setNegativeBalanceWarning, actingAsEmployee]);

  const hasNegativeBalance = useMemo(() => {
    return !!usageAmounts.find(u => u?.negativeWarning);
  }, [usageAmounts]);

  return (
    <>
      {usageAmounts && usageAmounts.length > 0 && (
        <div>
          <div className={classes.reasonHeaderContainer}>
            <div className={classes.reason}>
              <InfoIcon color="primary" />
              <div className={classes.reasonText}>{t("Balance")}</div>
            </div>
            <div className={classes.used}>{t("Used")}</div>
            <div className={classes.remaining}>{t("Remaining")}</div>
          </div>
          {usageAmounts.map((ua, i) => {
            const [usedText, remainingText] = getUsedAndRemainingText(ua) ?? [];

            return (
              <div key={i} className={classes.reasonRowContainer}>
                <div className={classes.reason}>{ua.name}</div>
                <div className={classes.used}>{usedText}</div>
                <div className={classes.remaining}>{remainingText}</div>
              </div>
            );
          })}
          {hasNegativeBalance && (
            <div className={classes.warningText}>
              {t("This will result in a negative balance.")}
            </div>
          )}
        </div>
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
  warningText: {
    color: theme.customColors.darkRed,
    fontWeight: "bold",
    fontSize: theme.typography.pxToRem(14),
    marginTop: theme.spacing(),
  },
  reasonHeaderContainer: {
    background: "#F0F0F0",
    border: "1px solid #E5E5E5",
    padding: theme.spacing(1),
    display: "flex",
    width: "100%",
    alignItems: "center",
    marginTop: theme.spacing(),
    fontWeight: "bold",
  },
  reasonRowContainer: {
    borderBottom: "1px solid #E5E5E5",
    padding: theme.spacing(1),
    display: "flex",
    width: "100%",
  },
  reason: {
    width: "50%",
    display: "flex",
    alignItems: "center",
  },
  reasonText: {
    marginLeft: theme.spacing(),
  },
  used: {
    width: "25%",
  },
  remaining: {
    width: "25%",
  },
}));
