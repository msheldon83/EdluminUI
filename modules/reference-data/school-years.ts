import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAllSchoolYears } from "./get-school-years.gen";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

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

export function useAllSchoolYearOptions(orgId: string | undefined) {
  const schoolYears = useAllSchoolYears(orgId);

  return useMemo(
    () =>
      schoolYears.map(sy => ({
        label: `${format(parseISO(sy.startDate), "yyyy")}-${format(
          parseISO(sy.endDate),
          "yyyy"
        )}`,
        value: sy.id,
      })),
    [schoolYears]
  );
}
