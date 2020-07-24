import * as React from "react";
import { useMutationBundle } from "graphql/hooks";
import { AbsenceUI } from "../components/ui";
import { compact } from "lodash-es";
import {
  NeedsReplacement,
  AbsenceCreateInput,
  Absence,
} from "graphql/server-types.gen";
import { CreateAbsence } from "../graphql/create.gen";
import { ApolloError } from "apollo-client";
import { startOfMonth } from "date-fns";
import { useGetEmployee } from "reference-data/employee";

export const EmployeeCreateAbsence: React.FC<{}> = props => {
  const employee = useGetEmployee();

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

  // Our route definition for this page will ensure whomever gets here is an
  // Employee somewhere in their list of Org Users so our "!employee" check here is
  // just a way of waiting until the GraphQL Query in useGetEmployee has finished
  // processing before we move on with rendering the AbsenceUI
  if (!employee) {
    return <></>;
  }

  return (
    <AbsenceUI
      organizationId={employee.orgId}
      actingAsEmployee={true}
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
            }
          : undefined
      }
      initialAbsenceFormData={{
        details: [],
        needsReplacement:
          employee.primaryPosition?.needsReplacement === NeedsReplacement.Yes,
      }}
      initialAbsenceState={() => {
        return {
          employeeId: employee.id,
          organizationId: employee.orgId,
          positionId: employee.primaryPosition?.id ?? "0",
          viewingCalendarMonth: startOfMonth(new Date()),
          absenceDates: [],
          isClosed: false,
          closedDates: [],
        };
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
