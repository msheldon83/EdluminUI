import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { useQueryBundle } from "graphql/hooks";
import { GetAbsence } from "./graphql/get-absence.gen";
import { useIsAdmin } from "reference-data/is-admin";
import { EditAbsenceUI } from "./ui";
import { NeedsReplacement } from "graphql/server-types.gen";

export const EditAbsence: React.FC = () => {
  const params = useRouteParams(AdminEditAbsenceRoute);
  const userIsAdmin = useIsAdmin();

  const absence = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
  });
  if (absence.state !== "DONE") {
    return <></>;
  }
  if (userIsAdmin === null) return <></>;
  // @ts-ignore - I think I've found a bug in typescript?
  const data = absence.data?.absence?.byId;
  // @ts-ignore
  const vacancy = data?.vacancies[0];
  const position = vacancy?.position;
  const employee = data?.employee;
  // @ts-ignore
  const detail = data?.details[0];
  // @ts-ignore
  const reasonUsage = detail?.reasonUsages[0];

  if (!data || !vacancy || !position || !employee || !detail || !reasonUsage) {
    return <></>;
  }

  return (
    <EditAbsenceUI
      firstName={employee.firstName}
      lastName={employee.lastName}
      employeeId={employee.id.toString()}
      needsReplacement={position.needsReplacement ?? NeedsReplacement.No}
      userIsAdmin={userIsAdmin}
      positionId={position.id}
      positionName={position.name}
      organizationId={data.organization.id}
      absenceReasonId={reasonUsage?.absenceReasonId}
      absenceId={data.id}
    />
  );
};
