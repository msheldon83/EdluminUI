import { isSameDay, startOfDay, parseISO } from "date-fns";
import {
  differenceWith,
  filter,
  find,
  sortBy,
  compact,
  flatMap,
  isNil,
} from "lodash-es";
import { Reducer } from "react";
import { VacancyDetail } from "ui/components/absence/types";
import {
  Vacancy,
  Absence,
} from "graphql/server-types.gen";
import { mapAccountingCodeAllocationsToAccountingCodeValue } from "helpers/accounting-code-allocations";
import { AssignmentOnDate } from "./types";
import { AccountingCodeValue } from "ui/components/form/accounting-code-dropdown";
import { AbsenceReasonUsageData } from "./components/balance-usage";

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
              a => !incomingDates.find(d => isSameDay(d, a.startTimeLocal))
            ),
            ...action.assignments,
          ];
          break;
        }
        case "remove":
          assignments = assignments.filter(
            a =>
              !action.assignments.find(x =>
                isSameDay(x.startTimeLocal, a.startTimeLocal)
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

export const projectVacancyDetailsFromVacancies = (
  vacancies: Partial<Vacancy | null>[] | null | undefined,
  assignmentsByDate?: AssignmentOnDate[] | undefined
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
        isClosed: d.isClosed ?? false,
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

export const getAbsenceReasonUsageData = (
  absence: Absence
): AbsenceReasonUsageData[] => {
  const details = absence.details;
  const usages = flatMap(details, (d => d?.reasonUsages) ?? []) ?? [];
  const usageData: AbsenceReasonUsageData[] = compact(
    usages.map(u => {
      if (!u || isNil(u.dailyAmount) || isNil(u.hourlyAmount)) {
        return null;
      }

      return {
        hourlyAmount: u.hourlyAmount,
        dailyAmount: u.dailyAmount,
        absenceReasonId: u.absenceReasonId,
        absenceReason: {
          absenceReasonCategoryId: u.absenceReason?.absenceReasonCategoryId,
        },
      };
    })
  );
  return usageData;
};
