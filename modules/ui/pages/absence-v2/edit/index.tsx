import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRouteV2 } from "ui/routes/absence-v2";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { AbsenceUI } from "../components/ui";
import { NotFound } from "ui/pages/not-found";
import { GetEmployee } from "../graphql/get-employee.gen";
import { compact } from "lodash-es";
import {
  NeedsReplacement,
  AbsenceCreateInput,
  Absence,
  AbsenceUpdateInput,
} from "graphql/server-types.gen";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";
import {
  noAllocation,
  AccountingCodeValue,
} from "ui/components/form/accounting-code-dropdown";
import { CreateAbsence } from "../graphql/create.gen";
import { ApolloError } from "apollo-client";
import { GetAbsence } from "../graphql/get-absence.gen";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "hooks/use-snackbar";
import { useHistory } from "react-router";
import { DeleteAbsence } from "../graphql/delete-absence.gen";
import { ShowErrors } from "ui/components/error-helpers";
import { DeletedDataIndex } from "./deleted-data-index";
import { DeleteAbsenceVacancyDialog } from "ui/components/absence-vacancy/delete-absence-vacancy-dialog";
import { UpdateAbsence } from "../graphql/update-absence.gen";

export const EditAbsence: React.FC<{}> = props => {
  const { organizationId, absenceId } = useRouteParams(AdminEditAbsenceRouteV2);
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = React.useState(false);
  const [saveErrorsInfo, setSaveErrorsInfo] = React.useState<
    { error: ApolloError | null; confirmed: boolean } | undefined
  >();

  const absence = useQueryBundle(GetAbsence, {
    variables: {
      id: absenceId,
    },
  });

  const [updateAbsence] = useMutationBundle(UpdateAbsence, {
    onError: error => {
      setSaveErrorsInfo({
        error,
        confirmed: false,
      }),
    },
    refetchQueries: ["GetAbsence"],
  });

  const employee = React.useMemo(() => {
    if (absence.state === "DONE") {
      return absence.data.absence?.byId?.employee;
    }
  }, [absence]);

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onClickDelete = React.useCallback(() => setDeleteDialogIsOpen(true), [
    setDeleteDialogIsOpen,
  ]);
  const onDeleteAbsence = React.useCallback(async () => {
    const result = await deleteAbsence({
      variables: {
        absenceId,
      },
    });
    setDeleteDialogIsOpen(false);
    if (result?.data) {
      openSnackbar({
        message: t("Absence #{{absenceId}} has been deleted", {
          absenceId,
        }),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
      //goBack();
    }
  }, [deleteAbsence, absenceId, openSnackbar, t ]); //goBack

  if (absence.state !== "DONE" && absence.state !== "UPDATING") {
    return <></>;
  }

  if (!absence.data.absence?.byId) {
    return <DeletedDataIndex absenceId={absenceId} />;
  }

  return (
    <>
      <DeleteAbsenceVacancyDialog
        objectType={"absence"}
        onDelete={onDeleteAbsence}
        onClose={() => setDeleteDialogIsOpen(false)}
        open={deleteDialogIsOpen}
        //replacementEmployeeName={replacementEmployeeName}
      />
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
          const result = await updateAbsence({
            variables: {
              absence: data as AbsenceUpdateInput,
            },
          });
          const absence = result?.data?.absence?.update as Absence;
          return absence;
        }}
        saveErrorsInfo={saveErrorsInfo}
        onErrorsConfirmed={() =>
          setSaveErrorsInfo({ error: null, confirmed: true })
        }
        deleteAbsence={onClickDelete}
      />
    </>
  );
};
