import { VacancyDetailsFormData } from "../components/vacancy";
import {
  VacancyCreateInput,
  Vacancy,
  VacancyUpdateInput,
} from "graphql/server-types.gen";
import { parseISO } from "date-fns";

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
    details: v.details,
    ignoreWarnings: true,
  };
};

export const buildFormData = (v: Vacancy): VacancyDetailsFormData => {
  return {
    id: v.id ?? "",
    orgId: v.orgId,
    positionTypeId: v.position?.positionTypeId ?? "",
    contractId: v.position?.contractId ?? "",
    title: v.position?.title ?? "",
    notesToReplacement: v.notesToReplacement ?? "",
    ignoreWarnings: false,
    locationId: v.details ? v.details[0]?.locationId ?? "" : "",
    workDayScheduleId: v.details ? v.details[0]?.workDayScheduleId ?? "" : "",
    rowVersion: v.rowVersion,
    details: v.details
      ? v.details.map(d => {
          return {
            date: d?.startDate ? parseISO(d.startDate) : undefined,
            startTime: d?.startTimeLocalTimeSpan ?? "",
            endTime: d?.endTimeLocalTimeSpan ?? "",
            payCodeId: d?.payCodeId ?? "",
            locationId: d?.locationId ?? "",
            vacancyReasonId: d?.vacancyReasonId ?? "",
            accountingCodeAllocations: d?.accountingCodeAllocations
              ? d?.accountingCodeAllocations.map(a => {
                  return {
                    accountingCodeId: a?.accountingCodeId ?? "",
                    allocation: 1.0,
                  };
                })
              : [],
          };
        })
      : [],
    replacementEmployeeId: v.details
      ? v.details[0]?.assignment?.employeeId ?? ""
      : "",
    replacementEmployeeName:
      v.details && v.details[0]?.assignment
        ? `${v.details[0]?.assignment?.employee?.firstName ?? ""} ${v.details[0]
            ?.assignment?.employee?.lastName ?? ""}` ?? ""
        : "",
  };
};

export const buildVacancyUpdateInput = (
  v: VacancyDetailsFormData
): VacancyUpdateInput => {
  return {
    id: v.id,
    rowVersion: v.rowVersion,
    title: v.title,
    workDayScheduleId: v.workDayScheduleId,
    notesToReplacement: v.notesToReplacement,
    details: v.details,
    ignoreWarnings: true,
  };
};
