import { useQueryBundle } from "graphql/hooks";
import { compact, map } from "lodash-es";
import {
  GetEmployeeForCurrentUser,
  GetEmployeeForCurrentUserQueryResult,
} from "./get-employee-for-current-user.gen";
import { useMemo } from "react";

export function useGetEmployee() {
  const potentialEmployees = useQueryBundle(GetEmployeeForCurrentUser, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (potentialEmployees.state === "DONE") {
      return findEmployee(potentialEmployees);
    }
    return null;
  }, [potentialEmployees]);
}

const findEmployee = (data: GetEmployeeForCurrentUserQueryResult) => {
  const orgUsers = data.data?.userAccess?.me?.user?.orgUsers ?? [];
  const emps = compact(map(orgUsers, u => u?.employee));
  return emps[0];
};
