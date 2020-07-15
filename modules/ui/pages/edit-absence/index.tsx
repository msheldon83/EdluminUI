import { parseISO } from "date-fns";
import { isValid, startOfDay } from "date-fns/esm";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import {
  NeedsReplacement,
  VacancyDetailAccountingCode,
} from "graphql/server-types.gen";
import { AbsenceReasonUsageData } from "ui/components/absence/balance-usage";
import { compact, flatMap, isNil, sortBy, uniqBy } from "lodash-es";
import * as React from "react";
import { useMemo, useState } from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import {
  VacancyDetail,
  AssignmentOnDate,
} from "../../components/absence/types";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";
import { GetAbsence } from "./graphql/get-absence.gen";
import { EditAbsenceUI } from "./ui";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "hooks/use-snackbar";
import { DeletedDataIndex } from "./deleted-data-index";
import { DeleteAbsenceVacancyDialog } from "../../components/absence-vacancy/delete-absence-vacancy-dialog";
import { ShowErrors } from "ui/components/error-helpers";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { EmployeeHomeRoute } from "ui/routes/employee-home";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";

type Props = { actingAsEmployee?: boolean };
export const EditAbsence: React.FC<Props> = props => {
  const params = useRouteParams(AdminEditAbsenceRoute);

  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);

  const absence = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
  });

  const employee = useMemo(() => {
    if (absence.state === "DONE") {
      return absence.data.absence?.byId?.employee;
    }
  }, [absence]);

  const locationIds = employee?.locations?.map(l => l?.id ?? "");

  const goBack = React.useCallback(() => {
    if (document.referrer === "") {
      history.push(
        props.actingAsEmployee
          ? EmployeeHomeRoute.generate(params)
          : AdminHomeRoute.generate(params)
      );
    } else {
      history.goBack();
    }
  }, [history, params, props.actingAsEmployee]);

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
        absenceId: params.absenceId,
      },
    });
    setDeleteDialogIsOpen(false);
    if (result?.data) {
      openSnackbar({
        message: t("Absence #{{absenceId}} has been deleted", {
          absenceId: params.absenceId,
        }),
        dismissable: true,
        status: "success",
        autoHideDuration: 5000,
      });
      goBack();
    }
  }, [deleteAbsence, params.absenceId, openSnackbar, t, goBack]);

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const cancelAssignments = React.useCallback(
    async (
      assignmentId?: string,
      assignmentRowVersion?: string,
      vacancyDetailIds?: string[],
      preventAbsenceRefetch?: boolean
    ) => {
      if (absence.state !== "DONE") return;

      const assignments = compact(
        flatMap(absence.data.absence?.byId?.vacancies, v =>
          v?.details
            ?.filter(vd => vd?.assignment)
            .map(vd => {
              return {
                assignmentId: vd.assignment!.id,
                assignmentRowVersion: vd.assignment!.rowVersion,
                vacancyDetailId: vd.id,
              };
            })
        )
      );
      const uniqueAssignments = uniqBy(assignments, "assignmentId");

      if (!assignmentId && !vacancyDetailIds) {
        // No specific Assignment Id provided, cancel all Assignments
        await Promise.all(
          uniqueAssignments.map(a =>
            cancelAssignment({
              variables: {
                assignment: {
                  assignmentId: a.assignmentId,
                  rowVersion: a.assignmentRowVersion,
                },
              },
            })
          )
        );
      } else if (
        !assignmentId &&
        vacancyDetailIds &&
        vacancyDetailIds.length > 0
      ) {
        // Figure out which Assignments to cancel based on the Vacancy Detail Ids provided
        const matchingAssignments = assignments.filter(
          a => a.vacancyDetailId && vacancyDetailIds.includes(a.vacancyDetailId)
        );
        const assignmentsToCancel = uniqueAssignments.filter(u =>
          matchingAssignments.find(m => m.assignmentId === u.assignmentId)
        );

        await Promise.all(
          assignmentsToCancel.map(a => {
            // For the current Assignment, figure out which Vacancy Detail Ids are appropriate
            // to cancel. It might not be all of the Vacancy Detail Ids on the Assignment.
            const vacancyDetailIdsToCancel = matchingAssignments
              .filter(m => m.assignmentId === a.assignmentId)
              .map(m => m.vacancyDetailId)
              .filter(id => vacancyDetailIds.includes(id));
            return cancelAssignment({
              variables: {
                assignment: {
                  assignmentId: a.assignmentId,
                  rowVersion: a.assignmentRowVersion,
                  vacancyDetailIds: vacancyDetailIdsToCancel,
                },
              },
            });
          })
        );
      } else if (assignmentId) {
        const vacancyDetailIdsToCancel =
          vacancyDetailIds && vacancyDetailIds.length > 0
            ? vacancyDetailIds
            : undefined;
        // Cancelling a single Assignment (or part of a single Assignment)
        await cancelAssignment({
          variables: {
            assignment: {
              assignmentId: assignmentId,
              rowVersion: assignmentRowVersion ?? "",
              vacancyDetailIds: vacancyDetailIdsToCancel,
            },
          },
        });
      }

      if (!preventAbsenceRefetch) {
        // Reload the Absence
        await absence.refetch();
      }
    },
    [absence, cancelAssignment]
  );

  const initialVacancyDetails: VacancyDetail[] = useMemo(() => {
    if (absence.state !== "DONE" || !absence.data.absence?.byId) {
      return [];
    }
    const absenceDetails = absence.data.absence?.byId?.details;

    return compact(
      flatMap(absence.data.absence?.byId.vacancies ?? [], v => {
        return v!.details.map(d => {
          if (!d) return null;

          const absenceDetail = absenceDetails?.find(
            ad => ad?.startDate === d?.startDate
          );
          return {
            vacancyDetailId: d.id,
            date: d.startDate,
            startTime: d.startTimeLocal,
            endTime: d.endTimeLocal,
            locationId: d.locationId,
            payCodeId: d.payCodeId,
            accountingCodeAllocations: mapAccountingCodeAllocationsToAccountingCodeValue(
              d?.accountingCodeAllocations?.map(a => {
                return {
                  accountingCodeId: a.accountingCodeId,
                  accountingCodeName: a.accountingCode?.name,
                  allocation: a.allocation,
                };
              })
            ),
            assignmentId: d.assignment?.id,
            absenceStartTime: absenceDetail?.startTimeLocal,
            absenceEndTime: absenceDetail?.endTimeLocal,
            assignmentRowVersion: d.assignment?.rowVersion,
            assignmentStartDateTime: d.startTimeLocal,
            assignmentEmployeeId: d.assignment?.employee?.id,
            assignmentEmployeeFirstName: d.assignment?.employee?.firstName,
            assignmentEmployeeLastName: d.assignment?.employee?.lastName,
            isClosed: d.isClosed ?? false,
          };
        });
      })
    );
  }, [absence]);

  const assignmentsByDate: AssignmentOnDate[] = useMemo(() => {
    if (absence.state !== "DONE" || !absence.data.absence?.byId) {
      return [];
    }

    const allVacancyDetails = compact(
      flatMap(absence.data.absence?.byId.vacancies ?? [], v => {
        return v!.details.map(d => {
          if (!d) return null;
          return {
            date: d.startDate,
            assignmentId: d.assignment?.id,
            assignmentRowVersion: d.assignment?.rowVersion,
            assignmentStartDateTime: d.startTimeLocal,
            assignmentEmployeeId: d.assignment?.employee?.id,
            assignmentEmployeeFirstName: d.assignment?.employee?.firstName,
            assignmentEmployeeLastName: d.assignment?.employee?.lastName,
          };
        });
      })
    );

    const uniqueDetailsByDate = uniqBy(allVacancyDetails, "date");
    return uniqueDetailsByDate;
  }, [absence]);

  if (absence.state !== "DONE" && absence.state !== "UPDATING") {
    return <></>;
  }

  if (!absence.data.absence?.byId) {
    return <DeletedDataIndex absenceId={params.absenceId} />;
  }

  const data = absence.data?.absence?.byId;
  const vacancies = compact(data?.vacancies ?? []);
  const vacancy = vacancies[0];
  const needsReplacement =
    vacancy?.position?.needsReplacement ?? NeedsReplacement.No;
  const position = vacancy?.position;

  const vacancyDetails = compact(vacancy?.details ?? []);
  const assignmentId = vacancyDetails[0]?.assignment?.id;

  const details =
    data?.details &&
    data?.details.length === 0 &&
    data?.closedDetails &&
    data?.closedDetails.length > 0
      ? data?.closedDetails
      : data?.details ?? [];
  const detail = details[0];
  const reasonUsage = detail?.reasonUsages ? detail.reasonUsages[0] : undefined;
  const dayPart = detail?.dayPartId ?? undefined;

  let replacementEmployeeId: string | undefined;
  let replacementEmployeeName: string | undefined;
  let replacementEmail: string | undefined;

  const assignedEmployee = vacancy?.details[0]?.assignment?.employee;
  if (assignedEmployee) {
    replacementEmployeeId = assignedEmployee.id;
    replacementEmployeeName = `${assignedEmployee.firstName} ${assignedEmployee.lastName}`;
    replacementEmail = assignedEmployee.email ?? undefined;
  }

  const processedUsage: AbsenceReasonUsageData[] = (() => {
    const usages = flatMap(details, (d => d?.reasonUsages) ?? []) ?? [];
    return usages.reduce((p, u) => {
      if (u && !isNil(u.dailyAmount) && !isNil(u.hourlyAmount)) {
        return [
          ...p,
          {
            hourlyAmount: u.hourlyAmount,
            dailyAmount: u.dailyAmount,
            absenceReasonId: u.absenceReasonId,
          },
        ];
      }
      return p;
    }, [] as AbsenceReasonUsageData[]);
  })();

  const absenceDetailsIdsByDate: Record<string, string> = details.reduce(
    (m, d) => {
      const startDate = d?.startDate;
      const id = d?.id;
      if (!startDate || !id) return m;
      return { ...m, [startDate]: id };
    },
    {}
  );

  const absenceDates: Date[] = sortBy(
    compact(details.map(detail => detail?.startDate))
      .map(dateStr => startOfDay(parseISO(dateStr)))
      .filter(isValid)
  );

  if (!data || !employee || !detail || !reasonUsage) {
    return <></>;
  }

  return (
    <>
      <DeleteAbsenceVacancyDialog
        objectType={"absence"}
        onDelete={onDeleteAbsence}
        onClose={() => setDeleteDialogIsOpen(false)}
        open={deleteDialogIsOpen}
        replacementEmployeeName={replacementEmployeeName}
      />

      <EditAbsenceUI
        firstName={employee.firstName}
        lastName={employee.lastName}
        assignmentId={assignmentId}
        employeeId={employee.id}
        rowVersion={data.rowVersion}
        needsReplacement={needsReplacement}
        notesToApprover={data.notesToApprover ?? undefined}
        adminOnlyNotes={data.adminOnlyNotes ?? undefined}
        positionId={position?.id ?? employee.primaryPositionId ?? undefined}
        positionName={position?.title ?? employee.primaryPosition?.title}
        organizationId={data.organization.id}
        absenceReason={{
          id: reasonUsage.absenceReason!.id,
          name: reasonUsage.absenceReason!.name,
          requireNotesToAdmin:
            reasonUsage.absenceReason!.requireNotesToAdmin ?? false,
        }}
        absenceId={data.id}
        absenceDates={absenceDates}
        dayPart={dayPart}
        locationIds={locationIds}
        initialVacancyDetails={initialVacancyDetails}
        /* cf 2019-12-06 -
      it is impossible to satisfy the graphql type Vacancy, because it is impossible to
      satisfy the graphql type Organization, because it is infinitely recursive.  */
        initialVacancies={vacancies as any}
        initialAbsenceUsageData={processedUsage}
        absenceDetailsIdsByDate={absenceDetailsIdsByDate}
        replacementEmployeeId={replacementEmployeeId}
        replacementEmployeeName={replacementEmployeeName}
        replacementEmail={replacementEmail}
        actingAsEmployee={props.actingAsEmployee}
        startTimeLocal={detail.startTimeLocal}
        endTimeLocal={detail.endTimeLocal}
        cancelAssignments={cancelAssignments}
        refetchAbsence={absence.refetch}
        onDelete={onClickDelete}
        assignmentsByDate={assignmentsByDate}
        closedDates={data.closedDetails}
        isClosed={data.isClosed}
        positionTypeId={employee?.primaryPosition?.positionType?.id}
        approvalState={data.approvalState}
      />
    </>
  );
};
