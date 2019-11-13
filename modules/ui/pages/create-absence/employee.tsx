import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";
import {
  FindEmployeeForCurrentUser,
  FindEmployeeForCurrentUserQueryResult,
} from "./graphql/find-employee-for-current-user.gen";
import { CreateAbsenceUI } from "./ui";
import { flatMap, map, compact } from "lodash-es";
import { useIsAdmin } from "reference-data/is-admin";
import { NeedsReplacement } from "graphql/server-types.gen";

type Props = {};

export const EmployeeCreateAbsence: React.FC<Props> = props => {
  const potentialEmployees = useQueryBundle(FindEmployeeForCurrentUser, {
    fetchPolicy: "cache-first",
  });
  const userIsAdmin = useIsAdmin();
  if (
    (potentialEmployees.state !== "DONE" &&
      potentialEmployees.state !== "UPDATING") ||
    userIsAdmin === null
  ) {
    return <></>;
  }

  const employee = findEmployee(potentialEmployees);
  if (!employee) {
    throw new Error("The user is not an employee");
  }

  return (
    <CreateAbsenceUI
      employeeId={employee.id}
      actingAsEmployee
      organizationId={employee.orgId.toString()}
      userIsAdmin={userIsAdmin}
      needsReplacement={
        employee.primaryPosition?.needsReplacement ?? NeedsReplacement.No
      }
    />
  );
};

const findEmployee = (data: FindEmployeeForCurrentUserQueryResult) => {
  const orgUsers = data.data?.userAccess?.me?.user?.orgUsers ?? [];
  const emps = compact(map(orgUsers, u => u?.employee));
  return emps[0];
};
