import { useQueryBundle } from "graphql/hooks";
import { NeedsReplacement } from "graphql/server-types.gen";
import * as React from "react";
import { AdminCreateAbsenceRoute } from "ui/routes/create-absence";
import { useRouteParams } from "ui/routes/definition";
import { CreateAbsenceUI } from "./ui";
import { GetEmployee } from "ui/components/absence/graphql/get-employee.gen";
import { NotFound } from "ui/pages/not-found";
import {
  AccountingCodeValue,
  singleAllocation,
  noAllocation,
} from "ui/components/form/accounting-code-dropdown";

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

  if (employeeInfo.state !== "DONE") {
    return <></>;
  }
  if (!employeeInfo.data.employee?.byId) {
    return <NotFound />;
  }

  const locationIds = employeeInfo.data.employee?.byId?.locations?.map(
    l => l?.id ?? ""
  );

  const accountingCodeAllocations: AccountingCodeValue =
    employeeInfo.data.employee?.byId?.primaryPosition
      ?.accountingCodeAllocations &&
    employeeInfo.data.employee.byId.primaryPosition.accountingCodeAllocations[0]
      ?.accountingCodeId
      ? singleAllocation({
          label:
            employeeInfo.data.employee.byId.primaryPosition
              .accountingCodeAllocations[0]?.accountingCode?.name ?? "",
          value:
            employeeInfo.data.employee.byId.primaryPosition
              .accountingCodeAllocations[0]?.accountingCodeId,
        })
      : noAllocation();

  return (
    <CreateAbsenceUI
      firstName={employeeInfo.data.employee?.byId?.firstName}
      lastName={employeeInfo.data.employee?.byId?.lastName}
      organizationId={organizationId}
      employeeId={employeeId}
      locationIds={locationIds}
      needsReplacement={
        employeeInfo.data.employee?.byId?.primaryPosition?.needsReplacement ??
        NeedsReplacement.No
      }
      positionName={employeeInfo.data.employee?.byId?.primaryPosition?.title}
      positionId={employeeInfo.data.employee.byId.primaryPosition?.id}
      positionTypeId={
        employeeInfo.data.employee.byId.primaryPosition?.positionType?.id
      }
      payCodeId={
        employeeInfo.data.employee?.byId?.primaryPosition?.positionType
          ?.payCodeId
      }
      accountingCodeAllocations={accountingCodeAllocations}
    />
  );
};
