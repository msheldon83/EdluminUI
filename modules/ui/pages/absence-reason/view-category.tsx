import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import * as React from "react";
import {
  AbsenceReasonRoute,
  AbsenceReasonCategoryViewEditRoute,
} from "ui/routes/absence-reason";
import { useSnackbar } from "hooks/use-snackbar";
import { ShowErrors } from "ui/components/error-helpers";
import { useRouteParams } from "ui/routes/definition";
import { AbsenceReasonViewEditUI } from "./view-edit-ui";
import { useHistory } from "react-router";
import { GetAllAbsenceReasonCategoriesDocument } from "reference-data/get-absence-reason-categories.gen";
import { UpdateAbsenceReasonCategory } from "./graphql/update-absence-reason-category.gen";
import { DeleteAbsenceReasonCategory } from "./graphql/delete-absence-reason-category.gen";
import { GetAbsenceReasonCategory } from "./graphql/get-absence-reason-category.gen";

export const AbsenceReasonCategoryViewEditPage: React.FC<{}> = props => {
  const params = useRouteParams(AbsenceReasonCategoryViewEditRoute);
  const history = useHistory();
  const { openSnackbar } = useSnackbar();

  const absenceReasonCategoriesReferenceQuery = {
    query: GetAllAbsenceReasonCategoriesDocument,
    variables: { orgId: params.organizationId },
  };

  const [updateAbsenceReasonCategoryMutation] = useMutationBundle(
    UpdateAbsenceReasonCategory,
    {
      refetchQueries: [absenceReasonCategoriesReferenceQuery],
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const [deleteAbsenceReasonCategory] = useMutationBundle(
    DeleteAbsenceReasonCategory,
    {
      refetchQueries: [absenceReasonCategoriesReferenceQuery],
      onError: error => {
        ShowErrors(error, openSnackbar);
      },
    }
  );

  const deleteAbsenceReasonCallback = React.useCallback(async () => {
    const result = await deleteAbsenceReasonCategory({
      variables: { absenceReasonCategoryId: params.absenceReasonCategoryId },
    });
    if (result.data) {
      history.push(AbsenceReasonRoute.generate(params));
    }
  }, [deleteAbsenceReasonCategory, params, history]);

  const result = useQueryBundle(GetAbsenceReasonCategory, {
    fetchPolicy: "cache-and-network",
    variables: {
      absenceReasonCategoryId: params.absenceReasonCategoryId,
    },
  });
  if (result.state !== "DONE" && result.state !== "UPDATING") {
    return <></>;
  }

  const absenceReasonCategory = result.data.orgRef_AbsenceReasonCategory?.byId!;

  const updateAbsenceReason = (values: {
    name?: string | null;
    externalId?: string | null;
  }) =>
    updateAbsenceReasonCategoryMutation({
      variables: {
        absenceReasonCategory: {
          id: absenceReasonCategory.id,
          rowVersion: absenceReasonCategory.rowVersion,
          allowNegativeBalance: absenceReasonCategory.allowNegativeBalance,
          ...values,
        },
      },
    });

  return (
    <AbsenceReasonViewEditUI
      rowVersion={absenceReasonCategory.rowVersion}
      name={absenceReasonCategory.name}
      externalId={absenceReasonCategory.externalId || undefined}
      description={absenceReasonCategory.description || undefined}
      allowNegativeBalance={absenceReasonCategory.allowNegativeBalance}
      absenceReasonTrackingTypeId={
        absenceReasonCategory.absenceReasonTrackingTypeId || undefined
      }
      id={absenceReasonCategory.id}
      updateNameOrExternalId={updateAbsenceReason}
      onDelete={deleteAbsenceReasonCallback}
      isCategory={true}
    />
  );
};
