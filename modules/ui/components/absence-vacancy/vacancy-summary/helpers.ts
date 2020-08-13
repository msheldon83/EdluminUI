import {
  VacancySummaryDetail,
  AssignmentWithDetails,
  DateDetail,
  VacancySummaryDetailByAssignmentAndDate,
  AssignmentAction,
} from "./types";
import { format, isEqual as isDateEqual } from "date-fns";
import { isEqual } from "lodash-es";
import { secondsToFormattedHourMinuteString } from "helpers/time";
import { VacancyDetailsFormData } from "ui/pages/vacancy/helpers/types";
import { TFunction } from "i18next";
import { Vacancy } from "graphql/server-types.gen";
import { AssignmentOnDate } from "ui/pages/absence/types";

export const convertVacancyDetailsFormDataToVacancySummaryDetails = (
  vacancy: VacancyDetailsFormData
): VacancySummaryDetail[] => {
  const summaryDetails: VacancySummaryDetail[] = vacancy.details.map((d, i) => {
    return {
      vacancyId: vacancy.id,
      vacancyDetailId: d.id ?? "",
      date: d.date,
      startTimeLocal: d.startTime
        ? new Date(
            `${d.date.toDateString()} ${secondsToFormattedHourMinuteString(
              d.startTime
            )}`
          )
        : d.date,
      endTimeLocal: d.endTime
        ? new Date(
            `${d.date.toDateString()} ${secondsToFormattedHourMinuteString(
              d.endTime
            )}`
          )
        : d.date,
      payCodeId: d.payCodeId ?? undefined,
      payCodeName: d.payCodeName ?? undefined,
      locationId: vacancy.locationId,
      locationName: vacancy.locationName,
      accountingCodeAllocations:
        d.accountingCodeAllocations?.map(a => {
          return {
            accountingCodeId: a.accountingCodeId,
            accountingCodeName: a.accountingCodeName,
            allocation: a.allocation,
          };
        }) ?? [],
      assignment: d.assignment
        ? {
            id: d.assignment.id,
            rowVersion: d.assignment.rowVersion,
            employee: d.assignment.employee,
          }
        : undefined,
    };
  });
  return summaryDetails;
};

export const buildAssignmentGroups = (
  details: VacancySummaryDetail[],
  excludeAccountingCodesFromGrouping?: boolean,
  excludePayCodesFromGrouping?: boolean
): AssignmentWithDetails[] => {
  // Sort the details by their start times
  const sortedDetails = details
    .slice()
    .sort((a, b) => +a.startTimeLocal - +b.startTimeLocal);

  // When prearranging, we won't have any Assignment Ids yet, but we
  // can use the Employee Id as a stand in for that
  const isPrearrange = sortedDetails.length > 0 && !sortedDetails[0]?.vacancyId;

  // Group our details by the Assignment Id and the date of the details
  const detailsByAssignmentAndDate: VacancySummaryDetailByAssignmentAndDate[] = sortedDetails.reduce(
    (groupAccumulator, summaryDetailItem) => {
      // Find an existing group
      const matchingGroup = groupAccumulator.find(
        x =>
          ((!isPrearrange &&
            x.assignmentId === summaryDetailItem.assignment?.id) ||
            (isPrearrange &&
              summaryDetailItem.assignment?.employee?.id === x.employeeId)) &&
          isDateEqual(x.date, summaryDetailItem.date)
      );
      if (matchingGroup) {
        // Already have a group for this Assignment Id and Date
        matchingGroup.details.push(summaryDetailItem);
      } else {
        // Add a new group for this Assignment Id and Date
        groupAccumulator.push({
          assignmentId: summaryDetailItem.assignment?.id,
          employeeId: summaryDetailItem.assignment?.employee?.id,
          date: summaryDetailItem.date,
          startDateAndTimeLocal: summaryDetailItem.startTimeLocal,
          details: [summaryDetailItem],
        });
      }

      return groupAccumulator;
    },
    [] as VacancySummaryDetailByAssignmentAndDate[]
  );

  // Build out our Assignment groupings with details
  const groupedDetails: AssignmentWithDetails[] = detailsByAssignmentAndDate.reduce(
    (groupAccumulator, assignmentAndDateGroupItem) => {
      // Our comparisons are always against the last group in the list
      const lastGroup =
        groupAccumulator.length > 0
          ? groupAccumulator[groupAccumulator.length - 1]
          : undefined;

      if (
        (!isPrearrange &&
          lastGroup?.assignment?.id ===
            assignmentAndDateGroupItem.assignmentId) ||
        (isPrearrange &&
          lastGroup?.assignment?.employee?.id ===
            assignmentAndDateGroupItem.employeeId)
      ) {
        // Matched on Assignment Id which could be present and for a real Assignment
        // OR undefined and for an Unfilled section of the Vacancy
        if (
          lastGroup &&
          vacancySummaryDetailsAreEqual(
            lastGroup.details,
            assignmentAndDateGroupItem.details,
            excludeAccountingCodesFromGrouping,
            excludePayCodesFromGrouping
          )
        ) {
          // All of our details match so we can add this day and detail ids to this group
          lastGroup.dates.push(assignmentAndDateGroupItem.date);
          lastGroup.vacancyDetailIds.push(
            ...assignmentAndDateGroupItem.details.map(d => d.vacancyDetailId)
          );
          lastGroup.vacancyDetailIdsByDate.push({
            date: assignmentAndDateGroupItem.date,
            vacancyDetailIds: [
              ...assignmentAndDateGroupItem.details.map(d => d.vacancyDetailId),
            ],
          });
          lastGroup.vacancySummaryDetails.push(
            ...assignmentAndDateGroupItem.details
          );
        } else {
          // Details are different so we need to add a new group
          groupAccumulator.push(
            convertToAssignmentWithDetails(assignmentAndDateGroupItem)
          );
        }
      } else {
        // Either we don't have a "lastGroup" (initial loop) or we're changing Assignment Ids
        // and we need to start up a new group
        groupAccumulator.push(
          convertToAssignmentWithDetails(assignmentAndDateGroupItem)
        );
      }

      return groupAccumulator;
    },
    [] as AssignmentWithDetails[]
  );

  return groupedDetails;
};

export const vacancySummaryDetailsAreEqual = (
  assignmentDetails: DateDetail[],
  vacancySummaryDetails: VacancySummaryDetail[],
  excludeAccountingCodesFromGrouping?: boolean,
  excludePayCodesFromGrouping?: boolean
): boolean => {
  if (assignmentDetails.length !== vacancySummaryDetails.length) {
    return false;
  }

  for (let index = 0; index < assignmentDetails.length; index++) {
    const assignmentDetail = assignmentDetails[index];
    const vacancySummaryDetail = vacancySummaryDetails[index];

    // Compare the basic data
    if (
      assignmentDetail.startTime !==
        format(vacancySummaryDetail.startTimeLocal, "h:mm a") ||
      assignmentDetail.endTime !==
        format(vacancySummaryDetail.endTimeLocal, "h:mm a") ||
      assignmentDetail.locationId !== vacancySummaryDetail.locationId ||
      (!excludePayCodesFromGrouping &&
        assignmentDetail.payCodeId !== vacancySummaryDetail.payCodeId)
    ) {
      return false;
    }

    // Compare Accounting Code Allocations
    if (excludeAccountingCodesFromGrouping) {
      // We don't want to use the Accounting Code selections for grouping
      // so no need to compare any of those details
      return true;
    }

    if (
      !assignmentDetail.accountingCodeAllocations?.length &&
      !vacancySummaryDetail.accountingCodeAllocations?.length
    ) {
      // Neither side has any Accounting Codes
      return true;
    }

    if (
      assignmentDetail.accountingCodeAllocations?.length !==
      vacancySummaryDetail.accountingCodeAllocations?.length
    ) {
      // Difference in the number of Accounting Codes
      return false;
    }

    if (
      !isEqual(
        assignmentDetail.accountingCodeAllocations.sort(
          (a, b) => +a.accountingCodeId - +b.accountingCodeId
        ),
        vacancySummaryDetail.accountingCodeAllocations.sort(
          (a, b) => +a.accountingCodeId - +b.accountingCodeId
        )
      )
    ) {
      // Different accounting code lists
      return false;
    }
  }

  return true;
};

export const convertToAssignmentWithDetails = (
  summaryDetailsByAssignmentAndDate: VacancySummaryDetailByAssignmentAndDate
): AssignmentWithDetails => {
  const assignmentWithDetails: AssignmentWithDetails = {
    dates: [summaryDetailsByAssignmentAndDate.date],
    startDateAndTimeLocal:
      summaryDetailsByAssignmentAndDate.startDateAndTimeLocal,
    assignment: summaryDetailsByAssignmentAndDate.details[0].assignment,
    vacancyDetailIds: [
      ...summaryDetailsByAssignmentAndDate.details.map(d => d.vacancyDetailId),
    ],
    vacancyDetailIdsByDate: [
      {
        date: summaryDetailsByAssignmentAndDate.date,
        vacancyDetailIds: [
          ...summaryDetailsByAssignmentAndDate.details.map(
            d => d.vacancyDetailId
          ),
        ],
      },
    ],
    vacancySummaryDetails: summaryDetailsByAssignmentAndDate.details,
    details: summaryDetailsByAssignmentAndDate.details.map(d => {
      return {
        startTime: format(d.startTimeLocal, "h:mm a"),
        endTime: format(d.endTimeLocal, "h:mm a"),
        locationId: d.locationId,
        locationName: d.locationName,
        payCodeId: d.payCodeId,
        payCodeName: d.payCodeName,
        accountingCodeAllocations: d.accountingCodeAllocations,
      };
    }),
    absenceStartTime: summaryDetailsByAssignmentAndDate.details[0]
      .absenceStartTimeLocal
      ? format(
          summaryDetailsByAssignmentAndDate.details[0].absenceStartTimeLocal,
          "h:mm a"
        )
      : undefined,
    absenceEndTime: summaryDetailsByAssignmentAndDate.details[0]
      .absenceEndTimeLocal
      ? format(
          summaryDetailsByAssignmentAndDate.details[0].absenceEndTimeLocal,
          "h:mm a"
        )
      : undefined,
  };
  return assignmentWithDetails;
};

export const getActionButtonText = (action: AssignmentAction, t: TFunction) => {
  switch (action) {
    case "pre-arrange":
      return t("Pre-arrange");
    case "assign":
      return t("Assign");
    case "reassign":
      return t("Reassign");
    case "cancel":
      return t("Remove");
  }
};
