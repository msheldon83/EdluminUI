import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAbsenceReasons } from "./get-absence-reasons.gen";
import { useMemo } from "react";

export function useAbsenceReasons(orgId: string, positionTypeId?: string) {
  const absenceReasons = useQueryBundle(GetAbsenceReasons, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (
      absenceReasons.state === "DONE" &&
      absenceReasons.data.orgRef_AbsenceReason
    ) {
      const reasons =
        compact(absenceReasons.data.orgRef_AbsenceReason.all) ?? [];
      return positionTypeId
        ? reasons.filter(
            r =>
              r.positionTypeIds.includes(positionTypeId) || r.allPositionTypes
          )
        : reasons;
    }
    return [];
  }, [absenceReasons, positionTypeId]);
}

export function useAbsenceReasonOptions(
  orgId: string,
  additionalOptions?: { label: string; value: string }[],
  positionTypeId?: string
) {
  const absenceReasons = useAbsenceReasons(orgId, positionTypeId);
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
  additionalOptions?: { label: string; value: string }[],
  positionTypeId?: string
) {
  const absenceReasons = useAbsenceReasons(orgId, positionTypeId);
  const absenceReasonOptions = useMemo(
    () =>
      absenceReasons.map(r => ({
        label: r.category ? `${r.name} (${r.category.name})` : r.name,
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
