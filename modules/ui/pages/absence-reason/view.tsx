import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import {
  AbsenceReasonViewEditRoute,
  AbsenceReasonRoute,
} from "ui/routes/absence-reason";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useRouteParams } from "ui/routes/definition";
import { GetAbsenceReason } from "./graphql/get-absence-reason.gen";
import { UpdateAbsenceReason } from "./graphql/update-absence-reason.gen";
import { AbsenceReasonViewEditUI } from "./view-edit-ui";
import { DeleteAbsenceReason } from "./graphql/delete-absence-reason.gen";
import { useHistory } from "react-router";
import { GetAbsenceReasonsDocument } from "reference-data/get-absence-reasons.gen";

export const AbsenceReasonViewEditPage: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceReasonViewEditRoute);
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

  const absenceReasonsReferenceQuery = {
    query: GetAbsenceReasonsDocument,
    variables: { orgId: params.organizationId },
  };

  const [updateAbsenceReasonMutation] = useMutationBundle(UpdateAbsenceReason, {
    refetchQueries: [absenceReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const [deleteAbsenceReason] = useMutationBundle(DeleteAbsenceReason, {
    refetchQueries: [absenceReasonsReferenceQuery],
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const deleteAbsenceReasonCallback = React.useCallback(async () => {
    const result = await deleteAbsenceReason({
      variables: { absenceReasonId: params.absenceReasonId },
    });
    if (result.data) {
      history.push(AbsenceReasonRoute.generate(params));
    }
  }, [deleteAbsenceReason, params, history]);

  const result = useQueryBundle(GetAbsenceReason, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonId: params.absenceReasonId,
    },
  });
  if (result.state !== "DONE" && result.state !== "UPDATING") {
    return <></>;
  }

  const absenceReason = result.data.orgRef_AbsenceReason!.byId!;

  const updateAbsenceReason = async (values: {
    name?: string | null;
    externalId?: string | null;
    allPositions?: boolean | null;
    positionTypeIds?: string[] | null;
  }) => {
    await updateAbsenceReasonMutation({
      variables: {
        absenceReason: {
          id: absenceReason.id,
          rowVersion: absenceReason.rowVersion,
          allowNegativeBalance: absenceReason.allowNegativeBalance,
          isRestricted: absenceReason.isRestricted,
          ...values,
        },
      },
    });
    await result.refetch();
  };

  return (
    <AbsenceReasonViewEditUI
      rowVersion={absenceReason.rowVersion}
      name={absenceReason.name}
      externalId={absenceReason.externalId || undefined}
      code={absenceReason.code || undefined}
      description={absenceReason.description || undefined}
      allowNegativeBalance={absenceReason.allowNegativeBalance}
      isRestricted={absenceReason.isRestricted}
      requireNotesToAdmin={absenceReason.requireNotesToAdmin ?? false}
      category={absenceReason.category || undefined}
      id={absenceReason.id}
      updateNameOrExternalIdOrPositionTypes={updateAbsenceReason}
      onDelete={deleteAbsenceReasonCallback}
      positionTypes={absenceReason.positionTypes}
      allPositionTypes={absenceReason.allPositionTypes}
      requiresApproval={absenceReason.requiresApproval ?? false}
    />
  );
};
