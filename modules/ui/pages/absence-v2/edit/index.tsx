import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRouteV2 } from "ui/routes/absence-v2";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { AbsenceUI } from "../components/ui";
import { compact, flatMap, uniq } from "lodash-es";
import {
  NeedsReplacement,
  Absence,
  AbsenceUpdateInput,
  DayPart,
} from "graphql/server-types.gen";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";
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
import { startOfDay, parseISO, startOfMonth } from "date-fns";
import { EmployeeHomeRoute } from "ui/routes/employee-home";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { projectVacancyDetailsFromVacancies } from "../state";

type Props = { actingAsEmployee?: boolean };

export const EditAbsence: React.FC<Props> = props => {
  const { organizationId: adminOrgId, absenceId } = useRouteParams(
    AdminEditAbsenceRouteV2
  );
  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { actingAsEmployee = false } = props;

  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = React.useState(false);
  const [saveErrorsInfo, setSaveErrorsInfo] = React.useState<
    { error: ApolloError | null; confirmed: boolean } | undefined
  >();

  const absenceQuery = useQueryBundle(GetAbsence, {
    variables: {
      id: absenceId,
    },
  });

  const [updateAbsence] = useMutationBundle(UpdateAbsence, {
    onError: error =>
      setSaveErrorsInfo({
        error,
        confirmed: false,
      }),
    refetchQueries: ["GetAbsence"],
  });

  const [deleteAbsence] = useMutationBundle(DeleteAbsence, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });

  const onClickDelete = React.useCallback(() => setDeleteDialogIsOpen(true), [
    setDeleteDialogIsOpen,
  ]);

  const goBack = React.useCallback(() => {
    if (document.referrer === "") {
      history.push(
        actingAsEmployee
          ? EmployeeHomeRoute.generate({})
          : AdminHomeRoute.generate({ organizationId: adminOrgId })
      );
    } else {
      history.goBack();
    }
  }, [history, adminOrgId, actingAsEmployee]);

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
      goBack();
    }
  }, [deleteAbsence, absenceId, openSnackbar, t, goBack]);

  const absence: Absence | null | undefined = React.useMemo(() => {
    return absenceQuery.state !== "DONE" && absenceQuery.state !== "UPDATING"
      ? undefined
      : (absenceQuery.data.absence?.byId as Absence);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [absenceQuery.state]);

  const employee = absence?.employee;
  const vacancies = compact(absence?.vacancies ?? []);
  const vacancy = vacancies[0];
  const position = vacancy?.position;

  const absenceDetails = React.useMemo(() => {
    const details = compact(absence?.details);
    const closedDetails = compact(absence?.closedDetails);
    const detailsToUse = details.length === 0 ? closedDetails : details;

    return compact(detailsToUse).map(d => {
      return {
        id: d.id,
        date: startOfDay(parseISO(d.startDate)),
        dayPart: d.dayPartId ?? undefined,
        hourlyStartTime:
          d.dayPartId === DayPart.Hourly
            ? parseISO(d.startTimeLocal)
            : undefined,
        hourlyEndTime:
          d.dayPartId === DayPart.Hourly ? parseISO(d.endTimeLocal) : undefined,
        absenceReasonId: d.reasonUsages
          ? d.reasonUsages[0]?.absenceReasonId
          : undefined,
      };
    });
  }, [absence?.closedDetails, absence?.details]);

  const assignmentsByDate = React.useMemo(() => {
    if (!absence || !absence?.vacancies) {
      return [];
    }

    const assignments = compact(
      flatMap(
        absence?.vacancies?.map(v =>
          v?.details?.map(vd => {
            if (!vd.assignment) {
              return null;
            }

            return {
              detail: vd,
              assignment: vd.assignment,
            };
          })
        ) ?? []
      )
    );

    return assignments.map(a => {
      return {
        assignmentId: a.assignment.id,
        assignmentRowVersion: a.assignment.rowVersion,
        startTimeLocal: parseISO(a.detail.startTimeLocal),
        vacancyDetailId: a.detail.id,
        employee: {
          id: a.assignment.employeeId,
          firstName: a.assignment.employee?.firstName ?? "",
          lastName: a.assignment.employee?.lastName ?? "",
        },
      };
    });
  }, [absence]);

  const notesToApproverRequired = React.useMemo(() => {
    const allReasons = compact(
      flatMap((absence?.details ?? []).map(d => d?.reasonUsages))
    );
    const isRequired = allReasons.find(
      a => a.absenceReason?.requireNotesToAdmin
    );
    return !!isRequired;
  }, [absence?.details]);

  if (absenceQuery.state !== "DONE" && absenceQuery.state !== "UPDATING") {
    return <></>;
  }

  // We shouldn't get an Absence if its been deleted, but just in
  // case we do receive one from the server
  if (!absence || absence.isDeleted) {
    return <DeletedDataIndex absenceId={absenceId} />;
  }

  if (!absence || !employee) {
    return <></>;
  }

  const accountingCodeAllocations = compact(
    vacancy?.details
  )[0]?.accountingCodeAllocations?.map(a => {
    return {
      accountingCodeId: a.accountingCodeId,
      accountingCodeName: a.accountingCode?.name,
      allocation: a.allocation,
    };
  });

  const replacementEmployeeNames = uniq(
    compact(
      assignmentsByDate.map(a =>
        a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : null
      )
    )
  );

  const organizationId = absence.orgId;

  return (
    <>
      <DeleteAbsenceVacancyDialog
        objectType={"absence"}
        onDelete={onDeleteAbsence}
        onClose={() => setDeleteDialogIsOpen(false)}
        open={deleteDialogIsOpen}
        replacementEmployeeNames={replacementEmployeeNames}
      />
      <AbsenceUI
        organizationId={organizationId}
        actingAsEmployee={actingAsEmployee}
        employee={{
          id: employee.id,
          firstName: employee.firstName,
          lastName: employee.lastName,
          locationIds: compact(employee.locations?.map(l => l?.id)),
        }}
        position={
          position
            ? {
                id: position.id,
                needsReplacement:
                  position.needsReplacement ?? NeedsReplacement.No,
                title: position.title,
                positionTypeId: position.positionTypeId ?? undefined,
              }
            : undefined
        }
        initialAbsenceFormData={{
          id: absence?.id,
          details: absenceDetails,
          notesToApprover: absence?.notesToApprover ?? undefined,
          adminOnlyNotes: absence?.adminOnlyNotes ?? undefined,
          needsReplacement: !!vacancy,
          notesToReplacement: vacancy?.notesToReplacement ?? undefined,
          requireNotesToApprover: notesToApproverRequired,
          payCodeId: vacancy?.details
            ? vacancy?.details[0]?.payCodeId ?? undefined
            : undefined,
          accountingCodeAllocations: vacancy?.details
            ? mapAccountingCodeAllocationsToAccountingCodeValue(
                accountingCodeAllocations ?? undefined
              )
            : undefined,
        }}
        initialAbsenceState={() => {
          const absenceDates = absenceDetails.map(d => d.date);
          const viewingCalendarMonth =
            absenceDates.length > 0
              ? startOfMonth(absenceDates[0])
              : startOfMonth(new Date());
          return {
            absenceId: absence?.id,
            absenceRowVersion: absence?.rowVersion,
            vacancyId: vacancy?.id,
            employeeId: employee.id,
            organizationId: organizationId,
            positionId: position?.id ?? "0",
            viewingCalendarMonth,
            absenceDates,
            isClosed: absence?.isClosed ?? false,
            closedDates: absence?.closedDetails
              ? compact(absence?.closedDetails)?.map(cd =>
                  parseISO(cd.startDate)
                )
              : [],
            approvalState: absence?.approvalState,
            assignmentsByDate: assignmentsByDate,
            initialVacancyDetails: absence?.vacancies
              ? projectVacancyDetailsFromVacancies(absence.vacancies)
              : undefined,
          };
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
        refetchAbsence={async () => {
          await absenceQuery.refetch();
        }}
        absence={absence}
      />
    </>
  );
};
