import { AbsenceFormData, AbsenceDetail, AssignmentOnDate } from "./types";
import { AbsenceState } from "./state";
import {
  AbsenceCreateInput,
  AbsenceUpdateInput,
  AbsenceDetailCreateInput,
  DayPart,
  Absence,
  Vacancy,
} from "graphql/server-types.gen";
import { getAbsenceDates } from "ui/components/absence/helpers";
import { VacancyDetail } from "ui/components/absence/types";
import {
  isSameDay,
  startOfDay,
  parseISO,
  format,
  isBefore,
  isEqual,
} from "date-fns";
import { secondsSinceMidnight, parseTimeFromString } from "helpers/time";
import { convertStringToDate } from "helpers/date";
import {
  mapAccountingCodeAllocationsToAccountingCodeValue,
  mapAccountingCodeValueToAccountingCodeAllocations,
} from "helpers/accounting-code-allocations";
import { compact, sortBy, flatMap, isNil } from "lodash-es";
import { VacancySummaryDetail } from "ui/components/absence-vacancy/vacancy-summary/types";
import { AbsenceReasonUsageData } from "./components/balance-usage";

export const buildAbsenceInput = (
  formValues: AbsenceFormData,
  state: AbsenceState,
  vacancyDetails: VacancyDetail[],
  disabledDates: Date[],
  forProjections: boolean
): AbsenceCreateInput | AbsenceUpdateInput | null => {
  if (
    hasIncompleteDetails(formValues.details) ||
    formValues.details.length === 0
  ) {
    return null;
  }
  const dates = getAbsenceDates(
    formValues.details.map(d => d.date),
    disabledDates
  );
  if (!dates) return null;

  let absence: AbsenceCreateInput | AbsenceUpdateInput;
  if (!state.absenceId || forProjections) {
    absence = {
      orgId: state.organizationId,
      employeeId: state.employeeId,
    };
  } else {
    absence = {
      id: state.absenceId ?? "0",
      rowVersion: state.absenceRowVersion ?? "",
    };
  }

  // Add properties that span create and update
  absence = {
    ...absence,
    notesToApprover: forProjections ? undefined : formValues.notesToApprover,
    adminOnlyNotes: forProjections ? undefined : formValues.adminOnlyNotes,
    details: createAbsenceDetailInput(formValues.details, forProjections),
  };

  const hasEditedDetails = !!state.customizedVacanciesInput;

  // Build Vacancy Details in case we want to tell the server to use our Details
  // instead of it coming up with its own
  const vDetails = vacancyDetails?.map(v => {
    // If creating, look to see if we're trying to prearrange anyone for this detail
    const assignment = !state.absenceId
      ? state.assignmentsByDate?.find(
          a =>
            (v.vacancyDetailId && a.vacancyDetailId === v.vacancyDetailId) ||
            (!v.vacancyDetailId &&
              isSameDay(a.startTimeLocal, startOfDay(parseISO(v.date))))
        )
      : undefined;

    return (
      {
        date: v.date,
        locationId: v.locationId,
        startTime: secondsSinceMidnight(
          parseTimeFromString(
            format(convertStringToDate(v.startTime)!, "h:mm a")
          )
        ),
        endTime: secondsSinceMidnight(
          parseTimeFromString(format(convertStringToDate(v.endTime)!, "h:mm a"))
        ),
        payCodeId: !hasEditedDetails ? undefined : v.payCodeId ?? null,
        accountingCodeAllocations: !hasEditedDetails
          ? undefined
          : mapAccountingCodeValueToAccountingCodeAllocations(
              v.accountingCodeAllocations,
              true
            ),
        prearrangedReplacementEmployeeId: assignment?.employee?.id,
      } ?? undefined
    );
  });

  const notesToReplacement = forProjections
    ? undefined
    : formValues.notesToReplacement;

  // Populate the Vacancies on the Absence
  absence = {
    ...absence,
    /* TODO: When we support multi Position Employees we'll need to account for the following:
          When creating an Absence, there must be 1 Vacancy created here per Position Id.
      */
    vacancies: [
      {
        positionId: state.positionId ?? undefined,
        useSuppliedDetails:
          (hasEditedDetails || !!notesToReplacement) &&
          vDetails &&
          vDetails.length > 0,
        needsReplacement: formValues.needsReplacement,
        notesToReplacement: notesToReplacement,
        details: vDetails,
        accountingCodeAllocations:
          hasEditedDetails || !formValues.accountingCodeAllocations
            ? undefined
            : mapAccountingCodeValueToAccountingCodeAllocations(
                formValues.accountingCodeAllocations,
                true
              ),
        payCodeId:
          hasEditedDetails || !formValues.payCodeId
            ? undefined
            : formValues.payCodeId,
      },
    ],
  };
  return absence;
};

const createAbsenceDetailInput = (
  details: AbsenceDetail[],
  forProjections: boolean
): AbsenceDetailCreateInput[] => {
  return details.map(d => {
    let detail: AbsenceDetailCreateInput = {
      id: forProjections ? undefined : d.id,
      date: format(d.date, "P"),
      dayPartId: d.dayPart,
      reasons: [{ absenceReasonId: d.absenceReasonId }],
    };

    if (d.dayPart === DayPart.Hourly) {
      detail = {
        ...detail,
        startTime: secondsSinceMidnight(
          parseTimeFromString(format(d.hourlyStartTime!, "h:mm a"))
        ),
        endTime: secondsSinceMidnight(
          parseTimeFromString(format(d.hourlyEndTime!, "h:mm a"))
        ),
      };
    }

    return detail;
  });
};

const hasIncompleteDetails = (details: AbsenceDetail[]): boolean => {
  const incompleteDetail = details.find(
    d =>
      !d.absenceReasonId ||
      !d.dayPart ||
      (d.dayPart === DayPart.Hourly &&
        (!d.hourlyStartTime ||
          !d.hourlyEndTime ||
          isBefore(d.hourlyEndTime, d.hourlyStartTime)))
  );
  return !!incompleteDetail;
};

export const buildFormData = (absence: Absence): AbsenceFormData => {
  // Figure out the details to put into the form
  const details = compact(absence?.details);
  const closedDetails = compact(absence?.closedDetails);
  const detailsToUse = details.length === 0 ? closedDetails : details;
  const formDetails = sortBy(
    compact(detailsToUse).map(d => {
      return {
        id: d.id,
        date: startOfDay(parseISO(d.startDate)),
        dayPart: d.dayPartId ?? undefined,
        hourlyStartTime:
          d.dayPartId === DayPart.Hourly
            ? parseISO(d.startTimeLocal)
            : undefined,
        hourlyEndTime:
          d.dayPartId === DayPart.Hourly ? parseISO(d.endTimeLocal) : undefined,
        absenceReasonId: d.reasonUsages
          ? d.reasonUsages[0]?.absenceReasonId
          : undefined,
      };
    }),
    d => d.date
  );

  const vacancies = compact(absence?.vacancies ?? []);
  const vacancy = vacancies[0];

  // Figure out the overall accounting code allocations
  // that would display on the Absence Details view
  const accountingCodeAllocations = compact(
    vacancy?.details
  )[0]?.accountingCodeAllocations?.map(a => {
    return {
      accountingCodeId: a.accountingCodeId,
      accountingCodeName: a.accountingCode?.name,
      allocation: a.allocation,
    };
  });

  // Figure out if the form needs to enforce
  // Notes To Approver being required
  const allReasons = compact(
    flatMap((absence?.details ?? []).map(d => d?.reasonUsages))
  );
  const notesToApproverRequired = allReasons.find(
    a => a.absenceReason?.requireNotesToAdmin
  );

  return {
    details: formDetails,
    notesToApprover: absence?.notesToApprover ?? "",
    adminOnlyNotes: absence?.adminOnlyNotes ?? "",
    needsReplacement: !!vacancy,
    notesToReplacement: vacancy?.notesToReplacement ?? "",
    requireNotesToApprover: !!notesToApproverRequired,
    payCodeId: vacancy?.details
      ? vacancy?.details[0]?.payCodeId ?? undefined
      : undefined,
    accountingCodeAllocations: vacancy?.details
      ? mapAccountingCodeAllocationsToAccountingCodeValue(
          accountingCodeAllocations ?? undefined
        )
      : undefined,
    sameReasonForAllDetails: detailsHaveTheSameReasons(formDetails),
    sameTimesForAllDetails: detailsHaveTheSameTimes(formDetails),
  };
};

const detailsHaveTheSameReasons = (details: AbsenceDetail[]) => {
  if (!details || details.length === 0) {
    return true;
  }

  const absenceReasonIdToCompare = details[0].absenceReasonId;
  for (let index = 0; index < details.length; index++) {
    const absenceReasonId = details[index].absenceReasonId;
    if (!absenceReasonId && !absenceReasonIdToCompare) {
      continue;
    }

    if (absenceReasonId !== absenceReasonIdToCompare) {
      return false;
    }
  }

  return true;
};

const detailsHaveTheSameTimes = (details: AbsenceDetail[]) => {
  if (!details || details.length === 0) {
    return true;
  }

  const timesToCompare = {
    dayPart: details[0].dayPart,
    hourlyStartTime: details[0].hourlyStartTime,
    hourlyEndTime: details[0].hourlyEndTime,
  };
  for (let index = 0; index < details.length; index++) {
    const times = {
      dayPart: details[index].dayPart,
      hourlyStartTime: details[index].hourlyStartTime,
      hourlyEndTime: details[index].hourlyEndTime,
    };
    if (!times?.dayPart && !timesToCompare?.dayPart) {
      continue;
    }

    if (times.dayPart !== timesToCompare.dayPart) {
      return false;
    }

    // If Hourly, check if the start and end are the same
    if (
      times.dayPart === DayPart.Hourly &&
      (times.hourlyStartTime?.toISOString() !==
        timesToCompare.hourlyStartTime?.toISOString() ||
        times.hourlyEndTime?.toISOString() !==
          timesToCompare.hourlyEndTime?.toISOString())
    ) {
      return false;
    }
  }

  return true;
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
          isEqual(a.startTimeLocal, parseISO(d.startTimeLocal))
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

// The Assignments on the Vacancy > Vacancy Detail objects are going to be ignored
// in favor of the information provided by assignmentsByDate. The reason for this is
// that we often end up with a "vacancy" that is from the projected vacancies query
// and would never contain assignment information. Because of this potential, we have
// to keep track of the assignments separately so it's better to just always use that
// instead of picking and choosing when we use assignmentsByDate or VacancyDetail
export const convertVacancyToVacancySummaryDetails = (
  vacancy: Vacancy,
  assignmentsByDate: AssignmentOnDate[]
): VacancySummaryDetail[] => {
  const absenceDetails = vacancy?.absence?.details;
  return vacancy.details?.map(vd => {
    // Find a matching Absence Detail record if available
    const absenceDetail = absenceDetails?.find(
      ad => ad?.startDate === vd?.startDate
    );

    // Find a matching assignment from assignmentsByDate by vacancyDetailId
    // if we have it, otherwise by the exact start time
    const assignmentOnDate = assignmentsByDate?.find(
      a =>
        (vd.id && a.vacancyDetailId === vd.id) ||
        isEqual(a.startTimeLocal, parseISO(vd.startTimeLocal))
    );

    return {
      vacancyId: vacancy.id,
      vacancyDetailId: vd.id,
      date: parseISO(vd.startDate),
      startTimeLocal: parseISO(vd.startTimeLocal),
      endTimeLocal: parseISO(vd.endTimeLocal),
      locationId: vd.locationId,
      locationName: vd.location?.name ?? "",
      assignment: assignmentOnDate
        ? {
            id: assignmentOnDate.assignmentId,
            rowVersion: assignmentOnDate.assignmentRowVersion,
            employee: {
              id: assignmentOnDate.employee.id,
              firstName: assignmentOnDate.employee.firstName,
              lastName: assignmentOnDate.employee.lastName,
            },
          }
        : undefined,
      payCodeId: vd.payCodeId ?? undefined,
      payCodeName: vd.payCode?.name,
      accountingCodeAllocations:
        vd.accountingCodeAllocations?.map(a => {
          return {
            accountingCodeId: a.accountingCodeId,
            accountingCodeName: a.accountingCode?.name,
            allocation: a.allocation,
          };
        }) ?? [],
      absenceStartTimeLocal: absenceDetail?.startTimeLocal
        ? parseISO(absenceDetail.startTimeLocal)
        : undefined,
      absenceEndTimeLocal: absenceDetail?.endTimeLocal
        ? parseISO(absenceDetail.endTimeLocal)
        : undefined,
    };
  });
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
