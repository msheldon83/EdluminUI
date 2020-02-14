import { TFunction } from "i18next";

export type AbsenceReasonUsageData = {
  amount: number;
  absenceReasonTrackingTypeId: "INVALID" | "HOURLY" | "DAILY";
};

/*
      cf 2019-11-21
      Given that we can't select multiple absence reasons via the UI, I'm
      not attempting to implement this calculation in a way that could handle
      multiple absence reasons or differing units.
*/

export const computeAbsenceUsage = (usages: AbsenceReasonUsageData[]) => {
  if (usages.length < 1) return null;

  const trackingType = usages[0].absenceReasonTrackingTypeId;
  const amount = usages.reduce((m, v) => m + v.amount, 0);
  return { trackingType, amount };
};

export const computeAbsenceUsageText = (
  usages: AbsenceReasonUsageData[],
  t: TFunction
): string | null => {
  const usage = computeAbsenceUsage(usages);
  if (!usage) return null;
  const { trackingType, amount } = usage;
  const unitText = {
    INVALID: null,
    DAILY: ["day", "days"],
    HOURLY: ["hour", "hours"],
  }[trackingType];
  if (!unitText) return null;
  return `${t("Uses")} ${amount.toFixed(2)} ${t(
    unitText[Number(amount !== 1)]
  )} ${t("of your balance")}`;
};
