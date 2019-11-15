import { useQueryBundle } from "graphql/hooks";
import { NeedsReplacement } from "graphql/server-types.gen";
import { compact, map } from "lodash-es";
import * as React from "react";
import { useIsAdmin } from "reference-data/is-admin";
import {
  FindEmployeeForCurrentUser,
  FindEmployeeForCurrentUserQueryResult,
} from "./graphql/find-employee-for-current-user.gen";
import { CreateAbsenceUI } from "./ui";

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
      firstName={employee.firstName}
      lastName={employee.lastName}
      employeeId={employee.id}
      actingAsEmployee
      organizationId={employee.orgId.toString()}
      userIsAdmin={userIsAdmin}
      needsReplacement={
        employee.primaryPosition?.needsReplacement ?? NeedsReplacement.No
      }
      positionName={employee.primaryPosition?.name}
      positionId={employee.primaryPosition?.id}
    />
  );
};

const findEmployee = (data: FindEmployeeForCurrentUserQueryResult) => {
  const orgUsers = data.data?.userAccess?.me?.user?.orgUsers ?? [];
  const emps = compact(map(orgUsers, u => u?.employee));
  return emps[0];
};
