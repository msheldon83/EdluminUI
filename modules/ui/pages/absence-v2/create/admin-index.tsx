import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminCreateAbsenceRouteV2 } from "ui/routes/absence-v2";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { AbsenceUI } from "../components/ui";
import { NotFound } from "ui/pages/not-found";
import { GetEmployee } from "../graphql/get-employee.gen";
import { compact } from "lodash-es";
import {
  NeedsReplacement,
  AbsenceCreateInput,
  Absence,
} from "graphql/server-types.gen";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";
import {
  noAllocation,
  AccountingCodeValue,
} from "ui/components/form/accounting-code-dropdown";
import { CreateAbsence } from "../graphql/create.gen";
import { ApolloError } from "apollo-client";

export const AdminCreateAbsence: React.FC<{}> = props => {
  const { organizationId, employeeId } = useRouteParams(
    AdminCreateAbsenceRouteV2
  );
  const employeeInfo = useQueryBundle(GetEmployee, {
    variables: {
      employeeId: employeeId,
    },
  });

  const [createErrorsInfo, setCreateErrorsInfo] = React.useState<
    { error: ApolloError | null; confirmed: boolean } | undefined
  >();
  const [createAbsence] = useMutationBundle(CreateAbsence, {
    onError: error =>
      setCreateErrorsInfo({
        error,
        confirmed: false,
      }),
  });

  if (employeeInfo.state !== "DONE") {
    return <></>;
  }
  if (!employeeInfo.data.employee?.byId) {
    return <NotFound />;
  }

  const employee = employeeInfo.data.employee.byId;

  const defaultAccountingCodeAllocations: AccountingCodeValue = employee
    .primaryPosition?.accountingCodeAllocations
    ? mapAccountingCodeAllocationsToAccountingCodeValue(
        compact(
          employee.primaryPosition.accountingCodeAllocations?.map(a => {
            if (!a) {
              return null;
            }

            return {
              accountingCodeId: a.accountingCodeId,
              accountingCodeName: a.accountingCode?.name,
              allocation: a.allocation,
            };
          })
        )
      )
    : noAllocation();

  return (
    <AbsenceUI
      organizationId={organizationId}
      actingAsEmployee={false}
      employee={{
        id: employee.id,
        firstName: employee.firstName,
        lastName: employee.lastName,
        locationIds: compact(employee.locations?.map(l => l?.id)),
      }}
      position={
        employee.primaryPosition
          ? {
              id: employee.primaryPosition.id,
              needsReplacement:
                employee.primaryPosition.needsReplacement ??
                NeedsReplacement.No,
              title: employee.primaryPosition.title,
              positionTypeId:
                employee.primaryPosition.positionTypeId ?? undefined,
              defaultPayCodeId:
                employee.primaryPosition.positionType?.payCodeId ?? undefined,
              defaultAccountingCodeAllocations: defaultAccountingCodeAllocations,
            }
          : undefined
      }
      initialAbsenceData={{
        details: [],
        needsReplacement:
          employee.primaryPosition?.needsReplacement === NeedsReplacement.Yes,
        accountingCodeAllocations: defaultAccountingCodeAllocations,
        payCodeId:
          employee.primaryPosition?.positionType?.payCodeId ?? undefined,
      }}
      saveAbsence={async data => {
        const result = await createAbsence({
          variables: {
            absence: data as AbsenceCreateInput,
          },
        });
        const absence = result?.data?.absence?.create as Absence;
        return absence;
      }}
      saveErrorsInfo={createErrorsInfo}
      onErrorsConfirmed={() =>
        setCreateErrorsInfo({ error: null, confirmed: true })
      }
    />
  );
};
