import { useQueryBundle } from "graphql/hooks";
import { compact, map } from "lodash-es";
import { useMemo } from "react";
import {
  GetMyUserAccess,
  GetMyUserAccessQuery,
} from "./get-my-user-access.gen";

export function useGetEmployee() {
  const potentialEmployees = useQueryBundle(GetMyUserAccess, {
    fetchPolicy: "cache-first",
  });

  return useMemo(() => {
    if (potentialEmployees.state === "DONE") {
      return findEmployee(potentialEmployees.data);
    }
    return null;
  }, [potentialEmployees]);
}

const findEmployee = (data: GetMyUserAccessQuery) => {
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
