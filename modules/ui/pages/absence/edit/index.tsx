import * as React from "react";
import { useRouteParams } from "ui/routes/definition";
import { AdminEditAbsenceRoute } from "ui/routes/absence";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { AbsenceUI, buildFormData } from "../components/ui";
import { compact, flatMap, uniq } from "lodash-es";
import {
  NeedsReplacement,
  Absence,
  AbsenceUpdateInput,
} from "graphql/server-types.gen";
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
import { parseISO, startOfMonth } from "date-fns";
import { EmployeeHomeRoute } from "ui/routes/employee-home";
import { AdminHomeRoute } from "ui/routes/admin-home";
import {
  projectVacancyDetailsFromVacancies,
  getAbsenceReasonUsageData,
} from "../state";
import { convertVacancyToVacancySummaryDetails } from "ui/components/absence-vacancy/vacancy-summary/helpers";

type Props = { actingAsEmployee?: boolean };

export const EditAbsence: React.FC<Props> = props => {
  const { organizationId: adminOrgId, absenceId } = useRouteParams(
    AdminEditAbsenceRoute
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
  const position = vacancy?.position ?? employee?.primaryPosition;

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
          email: a.assignment.employee?.email ?? undefined,
        },
      };
    });
  }, [absence]);

  const unfilledVacancySummaryDetails = React.useMemo(() => {
    if (!absence || !absence.vacancies || !absence.vacancies[0]) {
      return undefined;
    }
    const allVacancySummaryDetails = convertVacancyToVacancySummaryDetails(
      absence.vacancies[0],
      assignmentsByDate
    );
    return allVacancySummaryDetails.filter(vsd => !vsd.assignment);
  }, [absence, assignmentsByDate]);

  const initialFormData = React.useMemo(() => {
    if (!absence) {
      return null;
    }

    // Figure out if Notes To Approver is required for this Absence
    const allReasons = compact(
      flatMap((absence.details ?? []).map(d => d?.reasonUsages))
    );
    const notesToApproverRequired = allReasons.find(
      a => a.absenceReason?.requireNotesToAdmin
    );

    return buildFormData(absence, !!notesToApproverRequired);
  }, [absence]);

  if (absenceQuery.state !== "DONE" && absenceQuery.state !== "UPDATING") {
    return <></>;
  }

  // We shouldn't get an Absence if its been deleted, but just in
  // case we do receive one from the server
  if (!absence || absence.isDeleted) {
    return <DeletedDataIndex absenceId={absenceId} />;
  }

  if (!absence || !employee || !initialFormData) {
    return <></>;
  }

  const replacementEmployeeNames = uniq(
    compact(
      assignmentsByDate.map(a =>
        a.employee ? `${a.employee.firstName} ${a.employee.lastName}` : null
      )
    )
  );

  const organizationId = absence.orgId;

  return (
    <React.Fragment key={absence.id}>
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
        initialAbsenceFormData={initialFormData}
        initialAbsenceState={() => {
          const absenceDates = (initialFormData?.details ?? []).map(
            d => d.date
          );
          const viewingCalendarMonth =
            absenceDates.length > 0
              ? startOfMonth(absenceDates[0])
              : startOfMonth(new Date());
          return {
            absenceId: absence.id,
            absenceRowVersion: absence.rowVersion,
            vacancyId: vacancy?.id,
            employeeId: employee.id,
            organizationId: organizationId,
            positionId: position?.id ?? "",
            viewingCalendarMonth,
            absenceDates,
            isClosed: absence.isClosed,
            closedDates: absence.closedDetails
              ? compact(absence.closedDetails)?.map(cd =>
                  parseISO(cd.startDate)
                )
              : [],
            assignmentsByDate: assignmentsByDate,
            initialVacancyDetails: absence.vacancies
              ? projectVacancyDetailsFromVacancies(absence.vacancies)
              : undefined,
            initialAbsenceReasonUsageData: getAbsenceReasonUsageData(absence),
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
        unfilledVacancySummaryDetails={unfilledVacancySummaryDetails}
      />
    </React.Fragment>
  );
};
