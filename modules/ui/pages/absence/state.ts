import {
  isSameDay,
  startOfDay,
  parseISO,
  isEqual,
  areIntervalsOverlapping,
} from "date-fns";
import {
  differenceWith,
  filter,
  find,
  sortBy,
  compact,
  flatMap,
} from "lodash-es";
import { Reducer } from "react";
import { Vacancy, Absence } from "graphql/server-types.gen";
import { AssignmentOnDate, VacancyDetail } from "./types";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
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
  | {
      action: "resetToInitialState";
      initialState: AbsenceState;
      keepAssignments?: boolean;
    }
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
      const isAbsenceCreate = !prev.absenceId;
      const date = startOfDay(action.date);
      if (find(prev.absenceDates, d => isSameDay(d, date))) {
        return {
          ...prev,
          customizedVacanciesInput: undefined,
          projectedVacancyDetails: undefined,
          projectedVacancies: undefined,
          absenceDates: filter(prev.absenceDates, d => !isSameDay(d, date)),
          assignmentsByDate: isAbsenceCreate
            ? filter(
                prev.assignmentsByDate,
                a => !isSameDay(a.startTimeLocal, date)
              )
            : prev.assignmentsByDate,
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
                endTimeLocal: parseISO(vd.endTimeLocal),
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
            endTimeLocal: a.endTimeLocal,
            vacancyDetailId: a.vacancyDetailId,
            assignmentId: a.assignment.id,
            assignmentRowVersion: a.assignment.rowVersion,
            employee: {
              id: a.assignment.employeeId,
              firstName: a.assignment.employee?.firstName ?? "",
              lastName: a.assignment.employee?.lastName ?? "",
              email: a.assignment.employee?.email ?? undefined,
            },
          };
        }),
        initialAbsenceReasonUsageData: getAbsenceReasonUsageData(
          action.updatedAbsence
        ),
      };
    }
    case "resetToInitialState": {
      if (!action.keepAssignments) {
        return action.initialState;
      }

      return {
        ...action.initialState,
        assignmentsByDate: prev.assignmentsByDate,
      };
    }
    case "setProjectedVacancies": {
      const isAbsenceCreate = !prev.absenceId;
      let updatedAssignmentsByDate = sortBy(
        prev.assignmentsByDate,
        a => a.startTimeLocal
      );
      const assignments: AssignmentOnDate[] = [];
      const allProjectedDetailTimes = compact(
        flatMap(
          action.projectedVacancies?.map(v =>
            v.details?.map(d =>
              d
                ? {
                    startTimeLocal: parseISO(d.startTimeLocal),
                    endTimeLocal: parseISO(d.endTimeLocal),
                  }
                : undefined
            )
          )
        )
      );

      if (isAbsenceCreate) {
        // On Create, we just look for exact matches
        allProjectedDetailTimes.forEach(d => {
          const match = updatedAssignmentsByDate.find(
            a =>
              isEqual(a.startTimeLocal, d.startTimeLocal) &&
              isEqual(a.endTimeLocal, d.endTimeLocal)
          );
          if (match) {
            assignments.push(match);
          }
        });
      } else {
        const initialAssignedVacancyDetails = prev.initialVacancyDetails
          ? sortBy(
              prev.initialVacancyDetails
                .filter(vd => !!vd.assignmentId)
                .map(vd => {
                  return {
                    ...vd,
                    startTimeLocal: parseISO(vd.startTime),
                    endTimeLocal: parseISO(vd.endTime),
                  };
                }),
              vd => vd.startTimeLocal
            )
          : [];
        allProjectedDetailTimes.forEach(a => {
          // Find a projected detail that matches either
          // exactly or on start time
          let match = initialAssignedVacancyDetails.find(
            vd =>
              (isEqual(a.startTimeLocal, vd.startTimeLocal) &&
                isEqual(a.endTimeLocal, vd.endTimeLocal)) ||
              isEqual(a.startTimeLocal, vd.startTimeLocal)
          );
          if (!match) {
            // Fallback to matching on an overlap or same day check
            match = initialAssignedVacancyDetails.find(
              vd =>
                areIntervalsOverlapping(
                  { start: a.startTimeLocal, end: a.endTimeLocal },
                  { start: vd.startTimeLocal, end: vd.endTimeLocal }
                ) || isSameDay(a.startTimeLocal, vd.startTimeLocal)
            );
          }
          console.log("match", match);
          if (match) {
            assignments.push({
              startTimeLocal: a.startTimeLocal,
              endTimeLocal: a.endTimeLocal,
              vacancyDetailId: match.vacancyDetailId,
              assignmentId: match.assignmentId,
              assignmentRowVersion: match.assignmentRowVersion,
              employee: {
                id: match.assignmentEmployeeId ?? "0",
                firstName: match.assignmentEmployeeFirstName ?? "",
                lastName: match.assignmentEmployeeLastName ?? "",
                email: match.assignmentEmployeeEmail,
              },
            });
          }
        });
        console.log(
          assignments,
          initialAssignedVacancyDetails,
          allProjectedDetailTimes
        );
      }

      updatedAssignmentsByDate = assignments;

      return {
        ...prev,
        projectedVacancies: action.projectedVacancies,
        projectedVacancyDetails: projectVacancyDetailsFromVacancies(
          action.projectedVacancies,
          updatedAssignmentsByDate
        ),
        assignmentsByDate: updatedAssignmentsByDate,
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
