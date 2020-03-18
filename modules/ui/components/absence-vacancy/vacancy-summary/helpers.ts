import {
  VacancySummaryDetail,
  AssignmentWithDetails,
  DateDetail,
  VacancySummaryDetailByAssignmentAndDate,
} from "./types";
import { format, isEqual as isDateEqual } from "date-fns";
import { isEqual } from "lodash-es";

export const buildAssignmentGroups = (
  details: VacancySummaryDetail[]
): AssignmentWithDetails[] => {
  // Sort the details by their start times
  const sortedDetails = details
    .slice()
    .sort((a, b) => +a.startTimeLocal - +b.startTimeLocal);

  // Group our details by the Assignment Id and the date of the details
  const detailsByAssignmentAndDate: VacancySummaryDetailByAssignmentAndDate[] = sortedDetails.reduce(
    (groupAccumulator, summaryDetailItem) => {
      // Find an existing group
      const matchingGroup = groupAccumulator.find(
        x =>
          x.assignmentId === summaryDetailItem.assignment?.id &&
          isDateEqual(x.date, summaryDetailItem.date)
      );
      if (matchingGroup) {
        // Already have a group for this Assignment Id and Date
        matchingGroup.details.push(summaryDetailItem);
      } else {
        // Add a new group for this Assignment Id and Date
        groupAccumulator.push({
          assignmentId: summaryDetailItem.assignment?.id,
          date: summaryDetailItem.date,
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
        lastGroup?.assignment?.id === assignmentAndDateGroupItem.assignmentId
      ) {
        // Matched on Assignment Id which could be present and for a real Assignment
        // OR undefined and for an Unfilled section of the Vacancy
        if (
          lastGroup &&
          vacancySummaryDetailsAreEqual(
            lastGroup.details,
            assignmentAndDateGroupItem.details
          )
        ) {
          // All of our details match so we can add this day and detail ids to this group
          lastGroup.dates.push(assignmentAndDateGroupItem.date);
          lastGroup.vacancyDetailIds.push(
            ...assignmentAndDateGroupItem.details.map(d => d.vacancyDetailId)
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

const vacancySummaryDetailsAreEqual = (
  assignmentDetails: DateDetail[],
  vacancySummaryDetails: VacancySummaryDetail[]
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
      assignmentDetail.payCodeId !== vacancySummaryDetail.payCodeId
    ) {
      return false;
    }

    // Compare Accounting Code Allocations
    if (
      assignmentDetail.accountingCodeAllocations?.length !==
      vacancySummaryDetail.accountingCodeAllocations?.length
    ) {
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
      return false;
    }
  }

  return true;
};

const convertToAssignmentWithDetails = (
  summaryDetailsByAssignmentAndDate: VacancySummaryDetailByAssignmentAndDate
): AssignmentWithDetails => {
  const assignmentWithDetails: AssignmentWithDetails = {
    dates: [summaryDetailsByAssignmentAndDate.date],
    assignment: summaryDetailsByAssignmentAndDate.details[0].assignment,
    vacancyDetailIds: [
      ...summaryDetailsByAssignmentAndDate.details.map(d => d.vacancyDetailId),
    ],
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
  };
  return assignmentWithDetails;
};
