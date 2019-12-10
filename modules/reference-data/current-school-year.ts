import { useQueryBundle } from "graphql/hooks";
import { GetCurrentSchoolYear } from "./get-current-school-year.gen";
import { useMemo } from "react";

export function useCurrentSchoolYear(orgId: string | undefined) {
  const schoolYear = useQueryBundle(GetCurrentSchoolYear, {
    fetchPolicy: "cache-first",
    variables: { orgId },
    skip: orgId === undefined,
  });

  return useMemo(() => {
    if (
      schoolYear.state === "DONE" &&
      schoolYear.data?.schoolYear?.currentSchoolYear
    ) {
      return schoolYear.data?.schoolYear?.currentSchoolYear;
    }
    return null;
  }, [schoolYear]);
}
