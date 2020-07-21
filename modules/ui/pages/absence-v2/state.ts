import { isSameDay, startOfDay, isEqual, parseISO } from "date-fns";
import { differenceWith, filter, find, sortBy } from "lodash-es";
import { Reducer } from "react";
import { VacancyDetail } from "ui/components/absence/types";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";
import { Vacancy, ApprovalStatus, Maybe } from "graphql/server-types.gen";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";
import { AssignmentOnDate } from "./types";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import { ApprovalWorkflowSteps } from "ui/components/absence-vacancy/approval-state/types";

export type AbsenceState = {
  employeeId: string;
  organizationId: string;
  positionId: string;
  viewingCalendarMonth: Date;
  absenceDates: Date[];
  absenceId?: string;
  absenceRowVersion?: string;
  isClosed?: boolean;
  closedDates: Date[];
  customizedVacanciesInput?: VacancyDetail[];
  projectedVacancies?: Vacancy[];
  projectedVacancyDetails?: VacancyDetail[];
  vacancySummaryDetailsToAssign: VacancySummaryDetail[];
  assignmentsByDate?: AssignmentOnDate[];
  approvalState?: {
    id: string;
    canApprove: boolean;
    approvalWorkflowId: string;
    approvalWorkflow: {
      steps: ApprovalWorkflowSteps[];
    };
    approvalStatusId: ApprovalStatus;
    deniedApproverGroupHeaderName?: string | null;
    approvedApproverGroupHeaderNames?: Maybe<string>[] | null;
    pendingApproverGroupHeaderName?: string | null;
    comments: {
      commentIsPublic: boolean;
    }[];
  } | null;
};

export type AbsenceActions =
  | { action: "switchMonth"; month: Date }
  | { action: "toggleDate"; date: Date }
  | { action: "setVacanciesInput"; input: undefined | VacancyDetail[] }
  | {
      action: "setAccountingCodesOnAllCustomVacancyDetails";
      accountingCodeValue: AccountingCodeValue;
    }
  | {
      action: "setPayCodeOnAllCustomVacancyDetails";
      payCodeId: string | null;
    }
  | {
      action: "setProjectedVacancies";
      projectedVacancies: undefined | Vacancy[];
    }
  | { action: "removeAbsenceDates"; dates: Date[] }
  | { action: "resetAfterSave" }
  | { action: "resetToInitialState"; initialState: AbsenceState }
  | {
      action: "setVacancySummaryDetailsToAssign";
      vacancySummaryDetailsToAssign: VacancySummaryDetail[];
    }
  | {
      action: "updateAssignments";
      assignments: AssignmentOnDate[];
      add: boolean;
    };

export const absenceReducer: Reducer<AbsenceState, AbsenceActions> = (
  prev,
  action
) => {
  switch (action.action) {
    case "switchMonth": {
      return { ...prev, viewingCalendarMonth: action.month };
    }
    case "toggleDate": {
      const date = startOfDay(action.date);
      if (find(prev.absenceDates, d => isSameDay(d, date))) {
        return {
          ...prev,
          customizedVacanciesInput: undefined,
          projectedVacancyDetails: undefined,
          projectedVacancies: undefined,
          absenceDates: filter(prev.absenceDates, d => !isSameDay(d, date)),
        };
      } else {
        return {
          ...prev,
          customizedVacanciesInput: undefined,
          projectedVacancyDetails: undefined,
          projectedVacancies: undefined,
          absenceDates: sortBy([...prev.absenceDates, date]),
        };
      }
    }
    case "setVacanciesInput": {
      return { ...prev, customizedVacanciesInput: action.input };
    }
    case "setAccountingCodesOnAllCustomVacancyDetails": {
      return {
        ...prev,
        customizedVacanciesInput: prev.customizedVacanciesInput?.map(v => {
          return {
            ...v,
            accountingCodeAllocations: action.accountingCodeValue,
          };
        }),
      };
    }
    case "setPayCodeOnAllCustomVacancyDetails": {
      return {
        ...prev,
        customizedVacanciesInput: prev.customizedVacanciesInput?.map(v => {
          return {
            ...v,
            payCodeId: action.payCodeId,
          };
        }),
      };
    }
    case "removeAbsenceDates": {
      return {
        ...prev,
        absenceDates: differenceWith(
          prev.absenceDates,
          action.dates,
          isSameDay
        ),
      };
    }
    case "resetAfterSave": {
      return { ...prev, customizedVacanciesInput: undefined };
    }
    case "resetToInitialState": {
      return action.initialState;
    }
    case "setVacancySummaryDetailsToAssign": {
      return {
        ...prev,
        vacancySummaryDetailsToAssign: action.vacancySummaryDetailsToAssign,
      };
    }
    case "setProjectedVacancies": {
      return {
        ...prev,
        projectedVacancies: action.projectedVacancies,
        projectedVacancyDetails: projectVacancyDetailsFromVacancies(
          action.projectedVacancies,
          prev.assignmentsByDate
        ),
      };
    }
    case "updateAssignments": {
      let assignments = [...(prev.assignmentsByDate ?? [])];
      const customizedVacancyDetails = prev.customizedVacanciesInput
        ? [...prev.customizedVacanciesInput]
        : undefined;
      const projectedVacancyDetails = prev.projectedVacancyDetails
        ? [...prev.projectedVacancyDetails]
        : undefined;

      if (action.add) {
        const incomingDates = action.assignments.map(a => a.startTimeLocal);
        assignments = [
          ...assignments.filter(
            a => !incomingDates.find(d => isSameDay(d, a.startTimeLocal))
          ),
          ...action.assignments,
        ];

        assignments.forEach(a => {
          // Set assignment info on any matching customized Vacancy Details
          if (customizedVacancyDetails) {
            const sameDayCustomizedDetails = (
              customizedVacancyDetails ?? []
            ).filter(cvd =>
              isSameDay(a.startTimeLocal, startOfDay(parseISO(cvd.date)))
            );
            sameDayCustomizedDetails.forEach(d => {
              d.assignmentId = a.assignmentId;
              d.assignmentRowVersion = a.assignmentRowVersion;
              d.assignmentStartDateTime = a.startTimeLocal?.toISOString();
              d.assignmentEmployeeId = a.employee?.id;
              d.assignmentEmployeeFirstName = a.employee?.firstName;
              d.assignmentEmployeeLastName = a.employee?.lastName;
            });
          }

          // Set assignment info on any matching projected Vacancy Details
          if (projectedVacancyDetails) {
            const sameDayDetails = (projectedVacancyDetails ?? []).filter(cvd =>
              isSameDay(a.startTimeLocal, startOfDay(parseISO(cvd.date)))
            );
            sameDayDetails.forEach(d => {
              d.assignmentId = a.assignmentId;
              d.assignmentRowVersion = a.assignmentRowVersion;
              d.assignmentStartDateTime = a.startTimeLocal?.toISOString();
              d.assignmentEmployeeId = a.employee?.id;
              d.assignmentEmployeeFirstName = a.employee?.firstName;
              d.assignmentEmployeeLastName = a.employee?.lastName;
            });
          }
        });
      } else {
        // Remove the specified assignments from the list
        assignments = assignments.filter(
          a =>
            !action.assignments.find(x =>
              isSameDay(x.startTimeLocal, a.startTimeLocal)
            )
        );

        // Using the assignments from the Action since those are the ones being removed
        action.assignments.forEach(a => {
          // Clear assignment info on any matching customized Vacancy Details
          if (customizedVacancyDetails) {
            const sameDayCustomizedDetails = (
              customizedVacancyDetails ?? []
            ).filter(cvd =>
              isSameDay(a.startTimeLocal, startOfDay(parseISO(cvd.date)))
            );
            sameDayCustomizedDetails.forEach(d => {
              d.assignmentId = undefined;
              d.assignmentRowVersion = undefined;
              d.assignmentStartDateTime = undefined;
              d.assignmentEmployeeId = undefined;
              d.assignmentEmployeeFirstName = undefined;
              d.assignmentEmployeeLastName = undefined;
            });
          }

          // Clear assignment info on any matching projected Vacancy Details
          if (projectedVacancyDetails) {
            const sameDayDetails = (projectedVacancyDetails ?? []).filter(cvd =>
              isSameDay(a.startTimeLocal, startOfDay(parseISO(cvd.date)))
            );
            sameDayDetails.forEach(d => {
              d.assignmentId = undefined;
              d.assignmentRowVersion = undefined;
              d.assignmentStartDateTime = undefined;
              d.assignmentEmployeeId = undefined;
              d.assignmentEmployeeFirstName = undefined;
              d.assignmentEmployeeLastName = undefined;
            });
          }
        });
      }

      return {
        ...prev,
        assignmentsByDate: assignments,
        customizedVacanciesInput: customizedVacancyDetails,
        projectedVacancyDetails: projectedVacancyDetails,
      };
    }
  }
};

const projectVacancyDetailsFromVacancies = (
  vacancies: Partial<Vacancy | null>[] | null | undefined,
  assignmentsByDate: AssignmentOnDate[] | undefined
): VacancyDetail[] => {
  if (!vacancies || vacancies.length < 1) {
    return [];
  }
  const absenceDetails = vacancies[0]?.absence?.details;
  return (vacancies[0]?.details ?? [])
    .map(d => {
      // Find a matching Absence Detail record if available
      const absenceDetail = absenceDetails?.find(
        ad => ad?.startDate === d?.startDate
      );

      // Find a matching assignment from state if we don't already
      // have one on the VacancyDetail record itself
      const assignment = assignmentsByDate?.find(
        a =>
          (d.id && a.vacancyDetailId === d.id) ||
          isSameDay(a.startTimeLocal, parseISO(d.startTimeLocal))
      );

      return {
        vacancyDetailId: d?.id,
        date: d?.startDate,
        locationId: d?.locationId,
        startTime: d?.startTimeLocal,
        endTime: d?.endTimeLocal,
        locationName: d?.location?.name,
        absenceStartTime: absenceDetail?.startTimeLocal,
        absenceEndTime: absenceDetail?.endTimeLocal,
        payCodeId: d?.payCodeId,
        accountingCodeAllocations: mapAccountingCodeAllocationsToAccountingCodeValue(
          d?.accountingCodeAllocations?.map(a => {
            return {
              accountingCodeId: a.accountingCodeId,
              accountingCodeName: a.accountingCode?.name,
              allocation: a.allocation,
            };
          })
        ),
        assignmentId: d?.assignment?.id ?? assignment?.assignmentId,
        assignmentRowVersion:
          d?.assignment?.rowVersion ?? assignment?.assignmentRowVersion,
        assignmentStartDateTime:
          d?.startTimeLocal ?? assignment?.startTimeLocal?.toISOString(),
        assignmentEmployeeId:
          d?.assignment?.employee?.id ?? assignment?.employee?.id,
        assignmentEmployeeFirstName:
          d?.assignment?.employee?.firstName ?? assignment?.employee?.firstName,
        assignmentEmployeeLastName:
          d?.assignment?.employee?.lastName ?? assignment?.employee?.lastName,
      } as VacancyDetail;
    })
    .filter(
      (detail): detail is VacancyDetail =>
        !!detail.locationId &&
        !!detail.date &&
        !!detail.startTime &&
        !!detail.endTime
    );
};
