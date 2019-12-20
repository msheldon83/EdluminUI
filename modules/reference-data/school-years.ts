import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAllSchoolYears } from "./get-school-years.gen";
import { useMemo } from "react";

export function useAllSchoolYears(orgId: string | undefined) {
  const schoolYears = useQueryBundle(GetAllSchoolYears, {
    fetchPolicy: "cache-first",
    variables: { orgId },
    skip: orgId === undefined,
  });

  return useMemo(() => {
    if (schoolYears.state === "DONE" && schoolYears.data?.schoolYear) {
      return compact(schoolYears.data.schoolYear.all) ?? [];
    }
    return [];
  }, [schoolYears]);
}
