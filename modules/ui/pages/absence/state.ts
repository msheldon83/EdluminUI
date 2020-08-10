import { isSameDay, startOfDay, parseISO, isEqual } from "date-fns";
import {
  differenceWith,
  filter,
  find,
  sortBy,
  compact,
  flatMap,
} from "lodash-es";
import { Reducer } from "react";
import {
  Vacancy,
  ApprovalStatus,
  Maybe,
  Absence,
} from "graphql/server-types.gen";
import { AssignmentOnDate, VacancyDetail } from "./types";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import { ApprovalWorkflowSteps } from "ui/components/absence-vacancy/approval-state/types";
import { AbsenceReasonUsageData } from "./components/balance-usage";
import {
  projectVacancyDetailsFromVacancies,
  getAbsenceReasonUsageData,
} from "./helpers";

export type AbsenceState = {
  employeeId: string;
  organizationId: string;
  positionId: string;
  viewingCalendarMonth: Date;
  absenceDates: Date[];
  absenceId?: string;
  absenceRowVersion?: string;
  vacancyId?: string;
  isClosed?: boolean;
  closedDates: Date[];
  projectedVacancies?: Vacancy[];
  projectedVacancyDetails?: VacancyDetail[];
  customizedVacanciesInput?: VacancyDetail[];
  initialVacancyDetails?: VacancyDetail[];
  assignmentsByDate: AssignmentOnDate[];
  initialAbsenceReasonUsageData?: AbsenceReasonUsageData[];
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
  | { action: "resetAfterSave"; updatedAbsence: Absence }
  | { action: "resetToInitialState"; initialState: AbsenceState }
  | {
      action: "updateAssignments";
      assignments: AssignmentOnDate[];
      addRemoveOrUpdate: "add" | "remove" | "update";
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
          assignmentsByDate: filter(
            prev.assignmentsByDate,
            a => !isSameDay(a.startTimeLocal, date) || !!a.assignmentId
          ),
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
      const allAssignments = compact(
        flatMap(
          action.updatedAbsence?.vacancies?.map(v =>
            v?.details?.map(vd => {
              if (!vd || !vd.assignment) {
                return null;
              }

              return {
                vacancyDetailId: vd.id,
                startTimeLocal: parseISO(vd.startTimeLocal),
                assignment: vd.assignment,
              };
            })
          )
        )
      );

      return {
        ...prev,
        customizedVacanciesInput: undefined,
        projectedVacancies: undefined,
        projectedVacancyDetails: undefined,
        initialVacancyDetails: action.updatedAbsence?.vacancies
          ? projectVacancyDetailsFromVacancies(action.updatedAbsence.vacancies)
          : undefined,
        absenceRowVersion: action.updatedAbsence?.rowVersion,
        vacancyId: action.updatedAbsence?.vacancies
          ? action.updatedAbsence?.vacancies[0]?.id
          : undefined,
        assignmentsByDate: allAssignments.map(a => {
          return {
            startTimeLocal: a.startTimeLocal,
            vacancyDetailId: a.vacancyDetailId,
            assignmentId: a.assignment.id,
            assignmentRowVersion: a.assignment.rowVersion,
            employee: {
              id: a.assignment.employeeId,
              firstName: a.assignment.employee?.firstName ?? "",
              lastName: a.assignment.employee?.lastName ?? "",
            },
          };
        }),
        initialAbsenceReasonUsageData: getAbsenceReasonUsageData(
          action.updatedAbsence
        ),
      };
    }
    case "resetToInitialState": {
      return action.initialState;
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
      switch (action.addRemoveOrUpdate) {
        case "add": {
          const incomingDates = action.assignments.map(a => a.startTimeLocal);
          assignments = [
            ...assignments.filter(
              a => !incomingDates.find(d => isEqual(d, a.startTimeLocal))
            ),
            ...action.assignments,
          ];
          break;
        }
        case "remove":
          assignments = assignments.filter(
            a =>
              !action.assignments.find(x =>
                isEqual(x.startTimeLocal, a.startTimeLocal)
              )
          );
          break;
        case "update":
          assignments = action.assignments;
          break;
      }

      return {
        ...prev,
        assignmentsByDate: assignments,
      };
    }
  }
};
