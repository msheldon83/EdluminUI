import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { useMemo } from "react";
import { GetAllAbsenceReasonCategories } from "./get-absence-reason-categories.gen";

export function useAbsenceReasonCategories(orgId: string) {
  const absenceReasonCategories = useQueryBundle(
    GetAllAbsenceReasonCategories,
    {
      fetchPolicy: "cache-first",
      variables: { orgId: orgId, includeExpired: false },
    }
  );

  return useMemo(() => {
    if (
      absenceReasonCategories.state === "DONE" &&
      absenceReasonCategories.data.orgRef_AbsenceReasonCategory
    ) {
      return (
        compact(
          absenceReasonCategories.data.orgRef_AbsenceReasonCategory.all
        ) ?? []
      );
    }
    return [];
  }, [absenceReasonCategories]);
}

export function useAbsenceReasonCategoryOptions(
  orgId: string,
  additionalOptions?: { label: string; value: string }[]
) {
  const absenceReasonCategories = useAbsenceReasonCategories(orgId);
  const absenceReasonCategoryOptions = useMemo(
    () => absenceReasonCategories.map(r => ({ label: r.name, value: r.id })),
    [absenceReasonCategories]
  );
  if (additionalOptions && additionalOptions.length > 0) {
    additionalOptions.forEach(x => {
      if (!absenceReasonCategoryOptions.find(y => y.value === x.value)) {
        absenceReasonCategoryOptions.push(x);
      }
    });
  }
  return absenceReasonCategoryOptions;
}
