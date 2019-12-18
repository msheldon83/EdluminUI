import { useQueryBundle } from "graphql/hooks";
import { NeedsReplacement } from "graphql/server-types.gen";
import * as React from "react";
import { useIsAdmin } from "reference-data/is-admin";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { CreateAbsenceUI } from "./ui";
import { GetEmployee } from "ui/components/absence/graphql/get-employee.gen";

type Props = {};

export const CreateAbsence: React.FC<Props> = props => {
  const { organizationId, employeeId } = useRouteParams(
    AdminCreateAbsenceRoute
  );
  const employeeInfo = useQueryBundle(GetEmployee, {
    variables: {
      employeeId: employeeId,
    },
  });
  const userIsAdmin = useIsAdmin();
  if (
    employeeInfo.state !== "DONE" ||
    userIsAdmin === null ||
    !employeeInfo.data.employee?.byId
  ) {
    return <></>;
  }
  return (
    <CreateAbsenceUI
      firstName={employeeInfo.data.employee?.byId?.firstName}
      lastName={employeeInfo.data.employee?.byId?.lastName}
      organizationId={organizationId}
      employeeId={employeeId}
      userIsAdmin={userIsAdmin}
      needsReplacement={
        employeeInfo.data.employee?.byId?.primaryPosition?.needsReplacement ??
        NeedsReplacement.No
      }
      positionName={employeeInfo.data.employee?.byId?.primaryPosition?.name}
      positionId={employeeInfo.data.employee.byId.primaryPosition?.id}
    />
  );
};
