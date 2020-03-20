import {
  VacancyCreateInput,
  Vacancy,
  VacancyUpdateInput,
} from "graphql/server-types.gen";
import { parseISO } from "date-fns";
import { VacancyDetailsFormData } from "./types";

export const buildVacancyCreateInput = (
  v: VacancyDetailsFormData
): VacancyCreateInput => {
  return {
    orgId: v.orgId,
    title: v.title,
    positionTypeId: v.positionTypeId,
    contractId: v.contractId,
    locationId: v.locationId,
    workDayScheduleId: v.workDayScheduleId,
    notesToReplacement: v.notesToReplacement,
    details: v.details.map(d => {
      return {
        date: d.date,
        startTime: d.startTime,
        endTime: d.endTime,
        vacancyReasonId: d.vacancyReasonId,
        payCodeId: d.payCodeId && d.payCodeId.length > 0 ? d.payCodeId : null,
        accountingCodeAllocations:
          d.accountingCodeAllocations?.map(a => {
            return {
              accountingCodeId: a.accountingCodeId,
              allocation: a.allocation,
            };
          }) ?? [],
        prearrangedReplacementEmployeeId: d.assignment
          ? d.assignment.employee.id
          : undefined,
      };
    }),
    ignoreWarnings: true,
  };
};

export const buildFormData = (v: Vacancy): VacancyDetailsFormData => {
  const locationId = v.details ? v.details[0]?.locationId ?? "" : "";
  const locationName = v.details ? v.details[0]?.location?.name ?? "" : "";

  return {
    id: v.id ?? "",
    orgId: v.orgId,
    positionTypeId: v.position?.positionTypeId ?? "",
    contractId: v.position?.contractId ?? "",
    title: v.position?.title ?? "",
    notesToReplacement: v.notesToReplacement ?? "",
    ignoreWarnings: false,
    locationId: locationId,
    locationName: locationName,
    workDayScheduleId: v.details ? v.details[0]?.workDayScheduleId ?? "" : "",
    rowVersion: v.rowVersion,
    details: v.details
      ? v.details.map((d, i) => {
          return {
            id: d.id,
            date: parseISO(d.startDate),
            startTime: d.startTimeLocalTimeSpan,
            endTime: d.endTimeLocalTimeSpan,
            locationId: locationId,
            payCodeId: d.payCodeId ?? undefined,
            payCodeName: d.payCode?.name,
            vacancyReasonId: d.vacancyReasonId ?? "",
            accountingCodeAllocations: d.accountingCodeAllocations.map(a => {
              return {
                accountingCodeId: a.accountingCodeId,
                accountingCodeName: a.accountingCode.name,
                allocation: a.allocation,
              };
            }),
            assignment: d.assignment
              ? {
                  id: d.assignment.id,
                  rowVersion: d.assignment.rowVersion,
                  employee: d.assignment.employee,
                }
              : undefined,
          };
        })
      : [],
  };
};

export const buildVacancyUpdateInput = (
  v: VacancyDetailsFormData,
  rowVersion: string | undefined
): VacancyUpdateInput => {
  return {
    id: v.id,
    rowVersion: rowVersion ?? "",
    title: v.title,
    workDayScheduleId: v.workDayScheduleId,
    notesToReplacement: v.notesToReplacement,
    details: v.details.map(d => {
      return {
        id: d.saved ? d.id : undefined,
        date: d.date,
        startTime: d.startTime,
        endTime: d.endTime,
        vacancyReasonId: d.vacancyReasonId,
        payCodeId: d.payCodeId && d.payCodeId.length > 0 ? d.payCodeId : null,
        accountingCodeAllocations:
          d.accountingCodeAllocations?.map(a => {
            return {
              accountingCodeId: a.accountingCodeId,
              allocation: a.allocation,
            };
          }) ?? [],
      };
    }),
    ignoreWarnings: true,
  };
};
