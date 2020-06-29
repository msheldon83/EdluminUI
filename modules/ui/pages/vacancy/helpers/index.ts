import {
  VacancyCreateInput,
  Vacancy,
  VacancyUpdateInput,
} from "graphql/server-types.gen";
import { parseISO } from "date-fns";
import { VacancyDetailsFormData, AccountingCodeAllocation } from "./types";
import { sum } from "lodash-es";
import { TFunction } from "i18next";

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
    adminOnlyNotes: v.adminOnlyNotes,
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
        prearrangedReplacementEmployeeId:
          d.assignment?.employee?.id ?? undefined,
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
    isClosed: v.isClosed,
    positionTypeId: v.position?.positionTypeId ?? "",
    contractId: v.position?.contractId ?? "",
    title: v.position?.title ?? "",
    notesToReplacement: v.notesToReplacement ?? "",
    adminOnlyNotes: v.adminOnlyNotes ?? "",
    ignoreWarnings: false,
    locationId: locationId,
    locationName: locationName,
    workDayScheduleId: v.details ? v.details[0]?.workDayScheduleId ?? "" : "",
    rowVersion: v.rowVersion,
    closedDetails: v.closedDetails
      ? v.closedDetails.map((d, i) => {
          return {
            id: d?.id,
            saved: true,
            isClosed: d?.isClosed ?? false,
            date: parseISO(d?.startDate),
            startTime: d?.startTimeLocalTimeSpan,
            endTime: d?.endTimeLocalTimeSpan,
            locationId: locationId,
            payCodeId: d?.payCodeId ?? undefined,
            payCodeName: d?.payCode?.name,
            vacancyReasonId: d?.vacancyReasonId ?? "",
            accountingCodeAllocations: d?.accountingCodeAllocations.map(a => {
              return {
                accountingCodeId: a.accountingCodeId,
                accountingCodeName: a.accountingCode?.name ?? "",
                allocation: a.allocation,
              };
            }),
            assignment: d?.assignment
              ? {
                  id: d.assignment.id,
                  rowVersion: d.assignment.rowVersion,
                  employee: d.assignment.employee ?? undefined,
                }
              : undefined,
          };
        })
      : [],
    details: v.details
      ? v.details.map((d, i) => {
          return {
            id: d.id,
            saved: true,
            isClosed: d.isClosed ?? false,
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
                accountingCodeName: a.accountingCode?.name ?? "",
                allocation: a.allocation,
              };
            }),
            assignment: d.assignment
              ? {
                  id: d.assignment.id,
                  rowVersion: d.assignment.rowVersion,
                  employee: d.assignment.employee ?? undefined,
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
    adminOnlyNotes: v.adminOnlyNotes,
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

export const validateAccountingCodeAllocations = (
  accountingCodeAllocations: AccountingCodeAllocation[],
  t: TFunction
): string | undefined => {
  if (!accountingCodeAllocations || accountingCodeAllocations.length === 0) {
    return undefined;
  }

  if (sum(accountingCodeAllocations.map(a => a.allocation)) !== 1) {
    // Allocations need to add up to 100%
    return t("Accounting code allocations do not total 100%");
  }

  return undefined;
};
