import {
  VacancySummaryDetail,
  AssignmentWithDetails,
  AssignmentDetail,
} from "./types";
import { format } from "date-fns";
import { isEqual } from "lodash-es";

export const buildVacancySummaryInfo = (
  details: VacancySummaryDetail[]
): AssignmentWithDetails[] => {
  // Sort the details by their start times
  const sortedDetails = details
    .slice()
    .sort((a, b) => a.startTimeLocal - b.startTimeLocal);

  // Build out our Assignment groupings with details
  const groupedDetails: AssignmentWithDetails[] = sortedDetails.reduce(
    (accumulator, item) => {
      // Our comparisons are always against the last group in the list
      const lastGroup =
        accumulator.length > 0
          ? accumulator[accumulator.length - 1]
          : undefined;
      if (lastGroup?.assignment?.id === item.assignment?.id) {
        // Matched on Assignment Id which could be present and for a real Assignment
        // OR undefined and for an Unfilled section of the Vacancy
        if (lastGroup && vacancySummaryDetailsAreEqual(lastGroup, item)) {
          // All of our details match so we can add this day and detail id to this group
          lastGroup.dates.push(item.date);
          lastGroup.vacancyDetailIds.push(item.vacancyDetailId);
        } else {
          // Details are different so we need to add a new group
          accumulator.push(convertToAssignmentWithDetails(item));
        }
      } else {
        // Either we don't have a "lastGroup" (initial loop) or we're changing Assignment Ids
        // and we need to start up a new group
        accumulator.push(convertToAssignmentWithDetails(item));
      }

      return accumulator;
    },
    [] as AssignmentWithDetails[]
  );

  return groupedDetails;
};

const vacancySummaryDetailsAreEqual = (
  assignmentDetail: AssignmentDetail,
  vacancySummaryDetail: VacancySummaryDetail
): boolean => {
  const basicComparisonResult =
    assignmentDetail.startTime ===
      format(vacancySummaryDetail.startTimeLocal, "h:mm a") &&
    assignmentDetail.endTime ===
      format(vacancySummaryDetail.endTimeLocal, "h:mm a") &&
    assignmentDetail.locationId === vacancySummaryDetail.locationId &&
    assignmentDetail.payCodeId === vacancySummaryDetail.payCodeId;

  if (!basicComparisonResult) {
    return false;
  }

  // Compare Accounting Code Allocations
  if (
    assignmentDetail.accountingCodeAllocations?.length !==
    vacancySummaryDetail.accountingCodeAllocations?.length
  ) {
    return false;
  }

  const accountingCodeComparisonResult = isEqual(
    assignmentDetail.accountingCodeAllocations,
    vacancySummaryDetail.accountingCodeAllocations
  );
  return accountingCodeComparisonResult;
};

const convertToAssignmentWithDetails = (
  vacancySummaryDetail: VacancySummaryDetail
): AssignmentWithDetails => {
  const assignmentWithDetails: AssignmentWithDetails = {
    dates: [vacancySummaryDetail.date],
    assignment: vacancySummaryDetail.assignment,
    vacancyDetailIds: [vacancySummaryDetail.vacancyDetailId],
    startTime: format(vacancySummaryDetail.startTimeLocal, "h:mm a"),
    endTime: format(vacancySummaryDetail.endTimeLocal, "h:mm a"),
    locationId: vacancySummaryDetail.locationId,
    locationName: vacancySummaryDetail.locationName,
    payCodeId: vacancySummaryDetail.payCodeId,
    payCodeName: vacancySummaryDetail.payCodeName,
    accountingCodeAllocations: vacancySummaryDetail.accountingCodeAllocations,
  };
  return assignmentWithDetails;
};
