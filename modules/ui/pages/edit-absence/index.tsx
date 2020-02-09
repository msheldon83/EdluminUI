import { parseISO } from "date-fns";
import { isValid, startOfDay } from "date-fns/esm";
import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { NeedsReplacement } from "graphql/server-types.gen";
import { AbsenceReasonUsageData } from "helpers/absence/computeAbsenceUsageText";
import { compact, flatMap, isNil, sortBy, uniqBy } from "lodash-es";
import * as React from "react";
import { useMemo, useState } from "react";
import { useIsAdmin } from "reference-data/is-admin";
import { GetEmployee } from "ui/components/absence/graphql/get-employee.gen";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/edit-absence";
import { VacancyDetail } from "../../components/absence/types";
import { CancelAssignment } from "./graphql/cancel-assignment.gen";
import { GetAbsence } from "./graphql/get-absence.gen";
import { EditAbsenceUI } from "./ui";
import { DeleteAbsence } from "ui/components/employee/graphql/delete-absence.gen";
import { useHistory } from "react-router";
import { useTranslation } from "react-i18next";
import { useSnackbar } from "hooks/use-snackbar";
import { DeleteDialog } from "./delete-absence-dialog";
import { ShowErrors } from "ui/components/error-helpers";
import { CancelChangesDialog } from "./cancel-changes-dialog";
import { AdminHomeRoute } from "ui/routes/admin-home";
import { EmployeeHomeRoute } from "ui/routes/employee-home";

/* eslint-disable @typescript-eslint/ban-ts-ignore */

type Props = { actingAsEmployee?: boolean };
export const EditAbsence: React.FC<Props> = props => {
  const params = useRouteParams(AdminEditAbsenceRoute);

  const history = useHistory();
  const { openSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
  const [cancelDialogIsOpen, setCancelDialogIsOpen] = useState(false);

  const absence = useQueryBundle(GetAbsence, {
    variables: {
      id: params.absenceId,
    },
  });
  const userIsAdmin = useIsAdmin(
    absence.state === "LOADING"
      ? undefined
      : absence.data?.absence?.byId?.organization.id.toString()
  );

  const employeeInfo = useQueryBundle(GetEmployee, {
    variables: {
      employeeId:
        absence.state === "DONE" && absence.data.absence?.byId?.employeeId
          ? absence.data.absence?.byId?.employeeId
          : "0",
    },
    skip: absence.state !== "DONE",
  });

  const employee = useMemo(() => {
    if (employeeInfo.state === "DONE") {
      return employeeInfo.data.employee?.byId;
    }
  }, [employeeInfo]);

  const locationIds = employee?.locations?.map(l => l?.id ?? "");

  const returnUrl: string | undefined = useMemo(() => {
    return history.location.state?.returnUrl;
  }, [history.location.state]);

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
  }, [deleteAbsence, params.absenceId, returnUrl, history, openSnackbar, t]);

  const onClickCancelChanges = React.useCallback(() => {
    setCancelDialogIsOpen(true);
  }, [setCancelDialogIsOpen]);

  const onCancelChanges = () => {
    goBack();
  };

  const goBack = () => {
    if (document.referrer === "") {
      history.push(
        props.actingAsEmployee
          ? EmployeeHomeRoute.generate(params)
          : AdminHomeRoute.generate(params)
      );
    } else {
      history.goBack();
    }
  };

  const [cancelAssignment] = useMutationBundle(CancelAssignment, {
    onError: error => {
      ShowErrors(error, openSnackbar);
    },
  });
  const cancelAssignments = React.useCallback(
    async (
      assignmentId?: string,
      assignmentRowVersion?: string,
      vacancyDetailIds?: string[]
    ) => {
      if (absence.state !== "DONE") return;

      if (!assignmentId) {
        // No specific Assignment Id provided, cancel all Assignments
        const assignments = uniqBy(
          compact(
            flatMap(absence.data.absence?.byId?.vacancies, v =>
              v?.details?.map(vd => vd?.assignment)
            )
          ),
          "id"
        );
        await Promise.all(
          assignments.map(a =>
            cancelAssignment({
              variables: {
                assignment: { assignmentId: a.id, rowVersion: a.rowVersion },
              },
            })
          )
        );
      } else {
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

      // Reload the Absence
      await absence.refetch();
    },
    [absence, cancelAssignment]
  );

  const initialVacancyDetails: VacancyDetail[] = useMemo(() => {
    if (absence.state !== "DONE") {
      return [];
    }
    return compact(
      // @ts-ignore
      flatMap(absence.data.absence?.byId.vacancies ?? [], v => {
        // @ts-ignore
        return v.details.map(d => {
          if (!d) return null;
          return {
            vacancyDetailId: d.id,
            date: d.startDate,
            startTime: d.startTimeLocal,
            endTime: d.endTimeLocal,
            locationId: d.locationId!,
            payCodeId: d.payCodeId,
            accountingCodeId:
              d?.accountingCodeAllocations &&
              d?.accountingCodeAllocations[0]?.accountingCode?.id,
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
  }, [absence]);

  if (absence.state !== "DONE" && absence.state !== "UPDATING") {
    return <></>;
  }
  if (userIsAdmin === null) return <></>;
  // @ts-ignore - I think I've found a bug in typescript?
  const data = absence.data?.absence?.byId;
  // @ts-ignore
  const vacancies = compact(data?.vacancies ?? []);
  const vacancy = vacancies[0];
  const needsSub = !!vacancy;
  const position = vacancy?.position;

  const vacancyDetails = compact(vacancy?.details ?? []);
  const assignmentId = vacancyDetails[0]?.assignment?.id;

  // @ts-ignore
  const details = data?.details ?? [];
  const detail = details[0];
  // @ts-ignore
  const reasonUsage = detail?.reasonUsages[0];
  // @ts-ignore
  const dayPart = detail?.dayPartId ?? undefined;

  let replacementEmployeeId: string | undefined;
  let replacementEmployeeName: string | undefined;

  // @ts-ignore
  const assignedEmployee = vacancy?.details[0]?.assignment?.employee;
  if (assignedEmployee) {
    replacementEmployeeId = assignedEmployee.id;
    replacementEmployeeName = `${assignedEmployee.firstName} ${assignedEmployee.lastName}`;
  }

  const processedUsage: AbsenceReasonUsageData[] = (() => {
    const usages = flatMap(details, (d => d?.reasonUsages) ?? []) ?? [];
    return usages.reduce((p, u) => {
      if (u && u.absenceReasonTrackingTypeId && !isNil(u.amount)) {
        return [
          ...p,
          {
            amount: u.amount,
            absenceReasonTrackingTypeId: u.absenceReasonTrackingTypeId,
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
      <DeleteDialog
        onDelete={onDeleteAbsence}
        onClose={() => setDeleteDialogIsOpen(false)}
        open={deleteDialogIsOpen}
        replacementEmployeeName={replacementEmployeeName}
      />
      <CancelChangesDialog
        onCancel={() => onCancelChanges()}
        onClose={() => setCancelDialogIsOpen(false)}
        open={cancelDialogIsOpen}
      />
      <EditAbsenceUI
        firstName={employee.firstName}
        lastName={employee.lastName}
        assignmentId={assignmentId}
        employeeId={employee.id}
        rowVersion={data.rowVersion}
        needsReplacement={needsSub ? NeedsReplacement.Yes : NeedsReplacement.No}
        notesToApprover={data.notesToApprover ?? undefined}
        userIsAdmin={userIsAdmin}
        positionId={position?.id ?? employee.primaryPositionId ?? undefined}
        positionName={position?.title ?? employee.primaryPosition?.title}
        organizationId={data.organization.id}
        absenceReasonId={reasonUsage?.absenceReasonId}
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
        actingAsEmployee={props.actingAsEmployee}
        startTimeLocal={data.startTimeLocal}
        endTimeLocal={data.endTimeLocal}
        cancelAssignments={cancelAssignments}
        refetchAbsence={absence.refetch}
        onDelete={onClickDelete}
        onCancel={onClickCancelChanges}
      />
    </>
  );
};
