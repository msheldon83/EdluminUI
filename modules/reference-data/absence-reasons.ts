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
