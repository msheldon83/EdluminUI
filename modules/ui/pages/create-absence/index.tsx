import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { GetEmployee } from "./graphql/get-employee.gen";
import { CreateAbsenceUI } from "./ui";
import { useIsAdmin } from "reference-data/is-admin";
import { NeedsReplacement } from "graphql/server-types.gen";

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
    />
  );
};
