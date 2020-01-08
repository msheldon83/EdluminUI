import { useQueryBundle } from "graphql/hooks";
import { compact, map } from "lodash-es";
import { useMemo } from "react";
import {
  GetEmployeeForCurrentUser,
  GetEmployeeForCurrentUserQuery,
} from "./get-employee-for-current-user.gen";

export function useGetEmployee() {
  const potentialEmployees = useQueryBundle(GetEmployeeForCurrentUser, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (potentialEmployees.state === "DONE") {
      return findEmployee(potentialEmployees.data);
    }
    return null;
  }, [potentialEmployees]);
}

const findEmployee = (data: GetEmployeeForCurrentUserQuery) => {
  const orgUsers = data.userAccess?.me?.user?.orgUsers ?? [];
  const emps = compact(
    map(orgUsers, u => {
      if (u?.isEmployee) {
        return u?.employee;
      }
    })
  );
  return emps[0];
};
