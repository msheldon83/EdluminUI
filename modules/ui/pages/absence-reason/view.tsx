import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { AbsenceReasonViewEditRoute } from "ui/routes/absence-reason";
import { useRouteParams } from "ui/routes/definition";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { UpdateAbsenceReason } from "./graphql/update-absence-reason.gen";
import { AbsenceReasonViewEditUI } from "./view-edit-ui";

export const AbsenceReasonViewEditPage: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceReasonViewEditRoute);

  const [updateAbsenceReasonMutation] = useMutationBundle(UpdateAbsenceReason);

  const result = useQueryBundle(GetAbsenceReason, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonId: params.absenceReasonId,
    },
  });
  if (result.state !== "DONE" && result.state !== "UPDATING") {
    return <></>;
  }

  const absenceReason = result.data.orgRef_AbsenceReason?.byId!;

  const updateAbsenceReason = (values: {
    name?: string | null;
    externalId?: string | null;
  }) =>
    updateAbsenceReasonMutation({
      variables: {
        absenceReason: {
          id: Number(absenceReason.id),
          rowVersion: absenceReason.rowVersion,
          isBucket: absenceReason.isBucket,
          allowNegativeBalance: absenceReason.allowNegativeBalance,
          ...values,
        },
      },
    });

  return (
    <AbsenceReasonViewEditUI
      rowVersion={absenceReason.rowVersion}
      name={absenceReason.name}
      externalId={absenceReason.externalId || undefined}
      description={absenceReason.description || undefined}
      allowNegativeBalance={absenceReason.allowNegativeBalance}
      absenceReasonTrackingTypeId={
        absenceReason.absenceReasonTrackingTypeId || undefined
      }
      id={absenceReason.id}
      updateNameOrExternalId={updateAbsenceReason}
    />
  );
};
