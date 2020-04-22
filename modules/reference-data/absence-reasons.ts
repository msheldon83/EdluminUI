import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAbsenceReasons } from "./get-absence-reasons.gen";
import { useMemo } from "react";

export function useAbsenceReasons(orgId: string) {
  const absenceReasons = useQueryBundle(GetAbsenceReasons, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (
      absenceReasons.state === "DONE" &&
      absenceReasons.data.orgRef_AbsenceReason
    ) {
      return compact(absenceReasons.data.orgRef_AbsenceReason.all) ?? [];
    }
    return [];
  }, [absenceReasons]);
}

export function useAbsenceReasonOptions(
  orgId: string,
  additionalOptions?: { label: string; value: string }[]
) {
  const absenceReasons = useAbsenceReasons(orgId);
  const absenceReasonOptions = useMemo(
    () => absenceReasons.map(r => ({ label: r.name, value: r.id })),
    [absenceReasons]
  );
  if (additionalOptions && additionalOptions.length > 0) {
    additionalOptions.forEach(x => {
      if (!absenceReasonOptions.find(y => y.value === x.value)) {
        absenceReasonOptions.push(x);
      }
    });
  }
  return absenceReasonOptions;
}

export function useAbsenceReasonOptionsWithCategories(
  orgId: string,
  additionalOptions?: { label: string; value: string }[]
) {
  const absenceReasons = useAbsenceReasons(orgId);
  const absenceReasonOptions = useMemo(
    () =>
      absenceReasons.map(r => ({
        label: r.category ? `${r.category.name}: ${r.name}` : r.name,
        value: r.id,
      })),
    [absenceReasons]
  );
  if (additionalOptions && additionalOptions.length > 0) {
    additionalOptions.forEach(x => {
      if (!absenceReasonOptions.find(y => y.value === x.value)) {
        absenceReasonOptions.push(x);
      }
    });
  }
  return absenceReasonOptions;
}
