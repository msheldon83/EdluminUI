import { format, parseISO, isEqual, isSameDay, isBefore } from "date-fns";
import {
  AbsenceDetail,
  AbsenceDetailDr,
  VacancyDetail,
  VacancyDetailDr,
  DailyReportV2 as DailyReportType,
  Vacancy,
  VacancyDr,
  Maybe,
  AbsenceDr,
  ApprovalStatus,
  DayPart,
} from "graphql/server-types.gen";
import { compact, flatMap, groupBy, some, every } from "lodash-es";
import { GetYesterdayTodayTomorrowFormat } from "helpers/date";
import { TFunction } from "i18next";
import { GroupOption } from "./filters/filter-params";
import { fullNameSort } from "helpers/full-name-sort";

export type CardType =
  | "unfilled"
  | "filled"
  | "noSubRequired"
  | "total"
  | "awaitingVerification";

export type DailyReportDetails = {
  groupedDetails: DetailGroup[];
  defaultOpenFlags: boolean[];
  allDetails: Detail[];
};

export type DetailGroup = {
  label: string;
  subGroups?: DetailGroup[];
  details?: Detail[];
};

export type Detail = {
  id: string;
  detailId: string;
  orgId: string;
  state: "unfilled" | "filled" | "noSubRequired" | "closed";
  type: "absence" | "vacancy";
  absenceRowVersion?: string;
  vacancyRowVersion?: string;
  vacancyId?: string;
  employee?: {
    id: string;
    name: string;
    lastName: string;
  };
  absenceReason?: string;
  vacancyReason?: string;
  dayPartId?: DayPart;
  date: Date;
  dateRange: string;
  startTime: string;
  endTime: string;
  created: string;
  isMultiDay: boolean;
  isClosed: boolean;
  substitute?: {
    id: string;
    name: string;
    phone: string;
  };
  subTimes: {
    startTime: string;
    endTime: string;
  }[];
  assignmentId?: string;
  assignmentRowVersion?: string;
  position?: {
    id?: string;
    title: string;
    name: string;
  };
  positionType?: {
    id: string;
    name: string;
  };
  locations?: {
    id?: string;
    times?: {
      startTime: string;
      endTime: string;
    };
    name: string;
  }[];
  approvalStatus?: ApprovalStatus;
};

export const filterDetailGroups = (
  groups: DetailGroup[],
  filterFn: (detail: Detail) => boolean
): DetailGroup[] =>
  groups.map(g => ({
    ...g,
    subGroups: g.subGroups
      ? filterDetailGroups(g.subGroups, filterFn)
      : undefined,
    details: g.details ? g.details.filter(filterFn) : undefined,
  }));

export const MapDailyReportDetails = (
  dailyReport: DailyReportType,
  orgId: string,
  date: Date,
  showAbsences: boolean,
  showVacancies: boolean,
  groupDetailsBy: GroupOption,
  subGroupDetailsBy: GroupOption | "",
  t: TFunction
): DailyReportDetails => {
  const details: Detail[] = [];

  const closedDetails: any = getClosedDays(dailyReport);
  const filteredFilledAbsences = dailyReport.filledAbsences
    ? filterOutAbsenceClosedDays(dailyReport.filledAbsences)
    : [];
  const filteredUnFilledAbsences = dailyReport.unfilledAbsences
    ? filterOutAbsenceClosedDays(dailyReport.unfilledAbsences)
    : [];
  const filteredFilledVacacnies = dailyReport.filledVacancies
    ? filterOutVacancyClosedDays(dailyReport.filledVacancies)
    : [];
  const filteredUnFilledVacancies = dailyReport.unfilledVacancies
    ? filterOutVacancyClosedDays(dailyReport.unfilledVacancies)
    : [];
  const filteredNosubReqd = dailyReport.noSubRequiredAbsences
    ? filterOutAbsenceClosedDays(dailyReport.noSubRequiredAbsences)
    : [];

  // Filled Absences
  const filledAbsencesDetails = flatMap(filteredFilledAbsences, a => {
    if (!a || !a.details) {
      return [];
    }

    return compact(a.details).map(absenceDetail => {
      const matchingVacancyDetails = getMatchingVacancyDetailsV2(
        absenceDetail,
        a.vacancies
      );
      const assignment = matchingVacancyDetails[0]?.assignment;
      const locations = matchingVacancyDetails.map(d => ({
        id: d.location.id,
        name: d.location.name,
        times: {
          startTime: format(parseISO(d.startTimeLocal), "h:mm a"),
          endTime: format(parseISO(d.endTimeLocal), "h:mm a"),
        },
      }));

      return {
        id: a.id,
        detailId: absenceDetail.id,
        orgId: orgId,
        state: "filled",
        type: "absence",
        isClosed: absenceDetail.isClosed,
        absenceRowVersion: a.rowVersion,
        vacancyRowVersion: matchingVacancyDetails[0]?.vacancyRowVersion,
        vacancyId: matchingVacancyDetails[0]?.vacancyId,
        employee: a.teacher
          ? {
              id: a.teacher.id,
              name: `${a.teacher.firstName} ${a.teacher.lastName}`,
              lastName: a.teacher.lastName,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages[0]?.absenceReason,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(a.startDate, a.endDate),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: GetDateInYesterdayTodayTomorrowFormat(
          a.createdLocal,
          "MMM d h:mm a"
        ),
        isMultiDay: a.isMultiDay,
        substitute: assignment?.substitute
          ? {
              id: assignment.substitute.id,
              name: `${assignment.substitute.firstName} ${assignment.substitute.lastName}`,
              phone: assignment.substitute.formattedPhone,
            }
          : undefined,
        subTimes: !matchingVacancyDetails ? [] : locations.map(l => l.times),
        assignmentId: assignment?.id,
        assignmentRowVersion: assignment?.rowVersion,
        position:
          a.vacancies && a.vacancies[0] && a.vacancies[0].position
            ? {
                id: a.vacancies[0].position.id,
                name: a.vacancies[0].position.name,
                title: a.vacancies[0].position.name,
              }
            : undefined,
        positionType:
          a.vacancies &&
          a.vacancies[0] &&
          a.vacancies[0].position &&
          a.vacancies[0].position.positionType
            ? {
                id: a.vacancies[0].position.positionType.id,
                name: a.vacancies[0].position.positionType.name,
              }
            : undefined,
        locations,
        approvalStatus: a.approvalStatus ?? undefined,
      } as Detail;
    });
  });
  // Add in getting the Sub for the appropriate Absence Detail > Vacancy Detail match
  details.push(...filledAbsencesDetails);

  // Filled Vacancies
  const filledVacancyDetails = flatMap(filteredFilledVacacnies, v => {
    if (!v || !v.details) {
      return [];
    }

    return compact(v.details).map(vacancyDetail => {
      return {
        id: v.id,
        detailId: vacancyDetail.id,
        orgId: orgId,
        state: "filled",
        type: "vacancy",
        isClosed: vacancyDetail.isClosed,
        vacancyRowVersion: v.rowVersion,
        vacancyId: v.id,
        date: parseISO(vacancyDetail.startDate),
        dateRange: getRangeDisplayText(v.startDate, v.endDate),
        startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
        created: GetDateInYesterdayTodayTomorrowFormat(
          v.createdLocal,
          "MMM d h:mm a"
        ),
        vacancyReason: vacancyDetail.vacancyReason,
        isMultiDay: v.isMultiDay,
        substitute:
          vacancyDetail.assignment && vacancyDetail.assignment.substitute
            ? {
                id: vacancyDetail.assignment.substitute.id,
                name: `${vacancyDetail.assignment.substitute.firstName} ${vacancyDetail.assignment.substitute.lastName}`,
                phone: vacancyDetail.assignment.substitute.formattedPhone,
              }
            : undefined,
        subTimes: [
          {
            startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
            endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
          },
        ],
        assignmentId: vacancyDetail?.assignment?.id,
        assignmentRowVersion: vacancyDetail?.assignment?.rowVersion,
        position: v.position
          ? {
              id: v.position.id,
              name: v.position.name,
              title: v.position.name,
            }
          : undefined,
        positionType: v.position?.positionType
          ? {
              id: v.position?.positionType.id,
              name: v.position?.positionType.name,
            }
          : undefined,
        locations: vacancyDetail.location
          ? [
              {
                id: vacancyDetail.location.id,
                name: vacancyDetail.location.name,
                times: {
                  startTime: format(
                    parseISO(vacancyDetail.startTimeLocal),
                    "h:mm a"
                  ),
                  endTime: format(
                    parseISO(vacancyDetail.endTimeLocal),
                    "h:mm a"
                  ),
                },
              },
            ]
          : [],
        approvalStatus: v.approvalStatus ?? undefined,
        dayPartId: undefined,
      } as Detail;
    });
  });
  details.push(...filledVacancyDetails);

  // Unfilled Absences
  const unfilledAbsencesDetails = flatMap(filteredUnFilledAbsences, a => {
    if (!a || !a.details) {
      return [];
    }

    return compact(a.details).map(absenceDetail => {
      const matchingVacancyDetails = getMatchingVacancyDetailsV2(
        absenceDetail,
        a.vacancies
      );
      const locations = matchingVacancyDetails.map(d => ({
        id: d.location.id,
        name: d.location.name,
        times: {
          startTime: format(parseISO(d.startTimeLocal), "h:mm a"),
          endTime: format(parseISO(d.endTimeLocal), "h:mm a"),
        },
      }));

      return {
        id: a.id,
        detailId: absenceDetail.id,
        orgId: orgId,
        state: "unfilled",
        type: "absence",
        isClosed: absenceDetail.isClosed,
        absenceRowVersion: a.rowVersion,
        vacancyRowVersion: matchingVacancyDetails[0]?.vacancyRowVersion,
        vacancyId: matchingVacancyDetails[0]?.vacancyId,
        employee: a.teacher
          ? {
              id: a.teacher.id,
              name: `${a.teacher.firstName} ${a.teacher.lastName}`,
              lastName: a.teacher.lastName,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages[0]?.absenceReason,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(a.startDate, a.endDate),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: GetDateInYesterdayTodayTomorrowFormat(
          a.createdLocal,
          "MMM d h:mm a"
        ),
        subTimes: !matchingVacancyDetails ? [] : locations.map(l => l.times),
        isMultiDay: a.isMultiDay,
        position:
          a.vacancies && a.vacancies[0] && a.vacancies[0].position
            ? {
                id: a.vacancies[0].position.id,
                name: a.vacancies[0].position.name,
              }
            : undefined,
        positionType:
          a.vacancies &&
          a.vacancies[0] &&
          a.vacancies[0].position &&
          a.vacancies[0].position.positionType
            ? {
                id: a.vacancies[0].position.positionType.id,
                name: a.vacancies[0].position.positionType.name,
              }
            : undefined,
        locations,
        approvalStatus: a.approvalStatus ?? undefined,
        dayPartId: a.details ? a.details[0]?.dayPartId : undefined,
      } as Detail;
    });
  });
  details.push(...unfilledAbsencesDetails);

  // Unfilled Vacancies
  const unfilledVacancyDetails = flatMap(filteredUnFilledVacancies, v => {
    if (!v || !v.details) {
      return [];
    }
    return compact(v.details).map(vacancyDetail => {
      return {
        id: v.id,
        detailId: vacancyDetail.id,
        orgId: orgId,
        state: "unfilled",
        isClosed: vacancyDetail.isClosed,
        type: "vacancy",
        vacancyRowVersion: v.rowVersion,
        vacancyId: v.id,
        date: parseISO(vacancyDetail.startDate),
        dateRange: getRangeDisplayText(v.startDate, v.endDate),
        startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
        created: GetDateInYesterdayTodayTomorrowFormat(
          v.createdLocal,
          "MMM d h:mm a"
        ),
        vacancyReason: vacancyDetail.vacancyReason,
        subTimes: [
          {
            startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
            endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
          },
        ],
        isMultiDay: v.isMultiDay,
        position: v.position
          ? {
              id: v.position.id,
              name: v.position.name,
            }
          : undefined,
        positionType: v.position?.positionType
          ? {
              id: v.position?.positionType.id,
              name: v.position?.positionType.name,
            }
          : undefined,
        locations: vacancyDetail.location
          ? [
              {
                id: vacancyDetail.location.id,
                name: vacancyDetail.location.name,
                times: {
                  startTime: format(
                    parseISO(vacancyDetail.startTimeLocal),
                    "h:mm a"
                  ),
                  endTime: format(
                    parseISO(vacancyDetail.endTimeLocal),
                    "h:mm a"
                  ),
                },
              },
            ]
          : [],
        approvalStatus: v.approvalStatus ?? undefined,
        dayPartId: undefined,
      } as Detail;
    });
  });
  details.push(...unfilledVacancyDetails);

  // No Sub Required Absences
  const noSubRequiredAbsencesDetails = flatMap(filteredNosubReqd, a => {
    if (!a || !a.details) {
      return [];
    }

    // Determine the Position Type
    let positionType: { id?: string; name: string } | undefined = undefined;
    if (a.positionTypes) {
      if (a.positionTypes.length === 1) {
        positionType = {
          id: a.positionTypes[0]!.id,
          name: a.positionTypes[0]!.name,
        };
      } else if (a.positionTypes.length > 1) {
        positionType = {
          name: `(${t("Multiple")})`,
        };
      }
    }

    const locations: { id?: string; name: string }[] = a.locations
      ? compact(a.locations)
      : [];

    return compact(a.details).map(absenceDetail => {
      return {
        id: a.id,
        detailId: absenceDetail.id,
        orgId: orgId,
        state: "noSubRequired",
        type: "absence",
        absenceRowVersion: a.rowVersion,
        isClosed: absenceDetail.isClosed,
        employee: a.teacher
          ? {
              id: a.teacher.id,
              name: `${a.teacher.firstName} ${a.teacher.lastName}`,
              lastName: a.teacher.lastName,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages[0]?.absenceReason,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(a.startDate, a.endDate),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: GetDateInYesterdayTodayTomorrowFormat(
          a.createdLocal,
          "MMM d h:mm a"
        ),
        isMultiDay: a.details && a.isMultiDay,
        position: positionType,
        positionType: positionType,
        locations,
        subTimes: [],
        approvalStatus: a.approvalStatus ?? undefined,
        dayPartId: a.details ? a.details[0]?.dayPartId : undefined,
      } as Detail;
    });
  });
  details.push(...noSubRequiredAbsencesDetails);

  // Closed Absences
  const closedAbsencesDetails = flatMap(closedDetails, (a: any) => {
    if (!a || !a.details) {
      return [];
    }

    // Determine the Position Type
    let positionType: { id?: string; name: string } | undefined = undefined;
    if (a.positionTypes) {
      if (a.positionTypes.length === 1) {
        positionType = {
          id: a.positionTypes[0]!.id,
          name: a.positionTypes[0]!.name,
        };
      } else if (a.positionTypes.length > 1) {
        positionType = {
          name: `(${t("Multiple")})`,
        };
      }
    }

    // Determine the Location
    const locations: { id?: string; name: string }[] = a.locations
      ? compact(a.locations)
      : [];
    if (a.__typename === "AbsenceDr") {
      return compact(a.details).map((d: any) => {
        const absenceDetail = d as AbsenceDetailDr;

        return {
          id: a.id,
          detailId: absenceDetail.id,
          orgId: orgId,
          state: "closed",
          type: "absence",
          absenceRowVersion: a.rowVersion,
          isClosed: absenceDetail.isClosed,
          employee: a.teacher
            ? {
                id: a.teacher.id,
                name: `${a.teacher.firstName} ${a.teacher.lastName}`,
                lastName: a.teacher.lastName,
              }
            : undefined,
          absenceReason: absenceDetail.reasonUsages[0]?.absenceReason,
          date: parseISO(absenceDetail.startDate),
          dateRange: getRangeDisplayText(a.startDate, a.endDate),
          startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
          endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
          created: GetDateInYesterdayTodayTomorrowFormat(
            a.createdLocal,
            "MMM d h:mm a"
          ),
          isMultiDay: a.isMultiDay,
          position: positionType,
          positionType: positionType,
          locations,
          subTimes: [],
          approvalStatus: a.approvalStatus ?? undefined,
          dayPartId: a.details ? a.details[0]?.dayPartId : undefined,
        } as Detail;
      });
    } else {
      return a.details.map((d: any) => {
        const vacancyDetail = d as VacancyDetailDr;
        return {
          id: a.id,
          detailId: vacancyDetail.id,
          orgId: orgId,
          state: "closed",
          isClosed: vacancyDetail.isClosed,
          type: "vacancy",
          vacancyRowVersion: a.rowVersion,
          vacancyId: a.id,
          date: parseISO(vacancyDetail.startDate),
          dateRange: getRangeDisplayText(a.startDate, a.endDate),
          startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
          endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
          created: GetDateInYesterdayTodayTomorrowFormat(
            a.createdLocal,
            "MMM d h:mm a"
          ),
          vacancyReason: vacancyDetail.vacancyReason,
          subTimes: [
            {
              startTime: format(
                parseISO(vacancyDetail.startTimeLocal),
                "h:mm a"
              ),
              endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
            },
          ],
          isMultiDay: a.isMultiDay,
          position: a.position
            ? {
                id: a.position.id,
                name: a.position.name,
              }
            : undefined,
          positionType: a.position?.positionType
            ? {
                id: a.position?.positionType.id,
                name: a.position?.positionType.name,
              }
            : undefined,
          locations: vacancyDetail.location
            ? [
                {
                  id: vacancyDetail.location.id,
                  name: vacancyDetail.location.name,
                  times: {
                    startTime: format(
                      parseISO(vacancyDetail.startTimeLocal),
                      "h:mm a"
                    ),
                    endTime: format(
                      parseISO(vacancyDetail.endTimeLocal),
                      "h:mm a"
                    ),
                  },
                },
              ]
            : [],
          approvalStatus: a.approvalStatus ?? undefined,
          dayPartId: undefined,
        } as Detail;
      });
    }
  });
  details.push(...closedAbsencesDetails);

  // Filter the list by only details that match the Date we are looking for
  const detailsForDate = details
    .filter(x => isEqual(x.date, date))
    .sort((a, b) =>
      a.employee && b.employee ? fullNameSort(a.employee, b.employee) : 0
    );

  // Filter the list by any client side filtering selections
  const filteredDetails = detailsForDate.filter(
    x =>
      (showAbsences && x.type === "absence") ||
      (showVacancies && x.type === "vacancy")
  );

  // Group the results based on the group by selection
  const groupFns: {
    grouper: (d: Detail) => unknown;
    labeller?: (key: string) => string;
    sorter?: (key1: string, key2: string) => number;
    mandatoryGroups?: string[];
  }[] = [groupDictionary[groupDetailsBy]];

  if (subGroupDetailsBy) groupFns.push(groupDictionary[subGroupDetailsBy]);

  const groupedDetails: DetailGroup[] = subGroupBy(details, groupFns);

  const defaultOpenFlags: boolean[] = groupedDetails.map(
    group => !!(group.details && group.details.length)
  );

  // Return an object that gives all of the groups as well as the raw details data
  return {
    groupedDetails,
    defaultOpenFlags,
    allDetails: filteredDetails,
  };
};

const getRangeDisplayText = (startDate: string, endDate: string): string => {
  const startDateAsDate = parseISO(startDate);
  const endDateAsDate = parseISO(endDate);

  if (
    startDateAsDate.getDate() === endDateAsDate.getDate() &&
    startDateAsDate.getMonth() === endDateAsDate.getMonth()
  ) {
    return format(startDateAsDate, "MMM d");
  } else {
    return `${format(startDateAsDate, "MMM d")} - ${format(
      endDateAsDate,
      "MMM d"
    )}`;
  }
};

type VacancyDetailWithVacancyInfo = VacancyDetail & {
  vacancyId: string;
  vacancyRowVersion: string;
};

type VacancyDetailWithVacancyInfoV2 = VacancyDetailDr & {
  vacancyId: string;
  vacancyRowVersion: string;
};

const getMatchingVacancyDetails = (
  absenceDetail: AbsenceDetail,
  vacancies: Maybe<Vacancy>[] | null | undefined
): VacancyDetailWithVacancyInfo[] => {
  if (!vacancies) {
    return [];
  }

  const allVacancyDetails = flatMap(vacancies, v =>
    v!.details.map(d => {
      return {
        ...d,
        vacancyRowVersion: v!.rowVersion,
        vacancyId: v!.id,
      };
    })
  );
  const matchingVacancyDetails = allVacancyDetails.filter(
    d =>
      d && isSameDay(parseISO(d.startDate), parseISO(absenceDetail.startDate))
  );

  // Make sure we're returning the Vacancy Details sorted by their start time
  const sortedVacancyDetails = matchingVacancyDetails.slice().sort((a, b) => {
    const startTimeAsDateA = parseISO(a.startTimeLocal);
    const startTimeAsDateB = parseISO(b.startTimeLocal);

    if (isEqual(startTimeAsDateA, startTimeAsDateB)) {
      // Fairly unlikely to occur
      return 0;
    }

    return isBefore(startTimeAsDateA, startTimeAsDateB) ? -1 : 1;
  });

  return sortedVacancyDetails as VacancyDetailWithVacancyInfo[];
};

const getMatchingVacancyDetailsV2 = (
  absenceDetail: AbsenceDetailDr,
  vacancies: Maybe<VacancyDr>[] | null | undefined
): VacancyDetailWithVacancyInfoV2[] => {
  if (!vacancies) {
    return [];
  }

  const allVacancyDetails = flatMap(vacancies, v =>
    v!.details.map(d => {
      return {
        ...(d as VacancyDetailDr),
        vacancyRowVersion: v!.rowVersion,
        vacancyId: v!.id,
      };
    })
  );
  const matchingVacancyDetails = allVacancyDetails.filter(
    d =>
      d && isSameDay(parseISO(d.startDate), parseISO(absenceDetail.startDate))
  );

  // Make sure we're returning the Vacancy Details sorted by their start time
  const sortedVacancyDetails = matchingVacancyDetails.slice().sort((a, b) => {
    const startTimeAsDateA = parseISO(a.startTimeLocal);
    const startTimeAsDateB = parseISO(b.startTimeLocal);

    if (isEqual(startTimeAsDateA, startTimeAsDateB)) {
      // Fairly unlikely to occur
      return 0;
    }

    return isBefore(startTimeAsDateA, startTimeAsDateB) ? -1 : 1;
  });

  return sortedVacancyDetails as VacancyDetailWithVacancyInfoV2[];
};

export const GetUnfilled = (details: Detail[]): Detail[] => {
  const unfilled = details.filter(x => x.state === "unfilled");
  return unfilled;
};

export const GetFilled = (details: Detail[]): Detail[] => {
  const filled = details.filter(x => x.state === "filled");
  return filled;
};

export const GetNoSubRequired = (details: Detail[]): Detail[] => {
  const noSubRequired = details.filter(x => x.state === "noSubRequired");
  return noSubRequired;
};

export const GetDateInYesterdayTodayTomorrowFormat = (
  date: Date | string,
  baseFormat: string
): string => {
  const dateInput = typeof date === "string" ? parseISO(date) : date;
  const dateFormat = GetYesterdayTodayTomorrowFormat(dateInput, baseFormat);
  return format(dateInput, dateFormat);
};

const getClosedDays = (dailyReport: DailyReportType) => {
  let closedDetails: any = [];
  if (dailyReport.unfilledAbsences) {
    closedDetails = closedDetails.concat(
      dailyReport.unfilledAbsences?.filter(a => {
        return (
          a?.isClosed ||
          some(a?.details, arr => {
            return arr?.isClosed;
          })
        );
      })
    );
  }
  if (dailyReport.filledAbsences) {
    closedDetails = closedDetails.concat(
      dailyReport.filledAbsences?.filter(a => {
        return (
          a?.isClosed ||
          some(a?.details, arr => {
            return arr?.isClosed;
          })
        );
      })
    );
  }
  if (dailyReport.unfilledVacancies) {
    closedDetails = closedDetails.concat(
      dailyReport.unfilledVacancies?.filter(a => {
        return (
          a?.isClosed ||
          some(a?.details, arr => {
            return arr?.isClosed;
          })
        );
      })
    );
  }
  if (dailyReport.filledVacancies) {
    closedDetails = closedDetails.concat(
      dailyReport.filledVacancies?.filter(a => {
        return (
          a?.isClosed ||
          some(a?.details, arr => {
            return arr?.isClosed;
          })
        );
      })
    );
  }
  if (dailyReport.noSubRequiredAbsences) {
    closedDetails = closedDetails.concat(
      dailyReport.noSubRequiredAbsences?.filter(a => {
        return (
          a?.isClosed ||
          some(a?.details, arr => {
            return arr?.isClosed;
          })
        );
      })
    );
  }
  return closedDetails;
};

const filterOutAbsenceClosedDays = (absences: Maybe<AbsenceDr>[]) => {
  return absences.filter(a => {
    return every(a?.details, arr => {
      return !arr?.isClosed;
    });
  });
};

const filterOutVacancyClosedDays = (vacancies: Maybe<VacancyDr>[]) => {
  return vacancies.filter(v => {
    return every(v?.details, arr => {
      return !arr?.isClosed;
    });
  });
};

// Options to be passed to subGroupBy, based on the values of groupBy and subGroupBy
export const groupDictionary: {
  [key in GroupOption]: {
    grouper: (d: Detail) => unknown;
    labeller?: (key: string) => string;
    sorter?: (key1: string, key2: string) => number;
    mandatoryGroups?: string[];
  };
} = {
  fillStatus: {
    grouper: d => d.state,
    labeller: k =>
      k == "noSubRequired"
        ? "No sub required"
        : k.charAt(0).toUpperCase() + k.slice(1),
    sorter: (k1, k2) => {
      const order = ["Unfilled", "Filled", "No sub required", "Closed"];
      return order.indexOf(k1) - order.indexOf(k2);
    },
    mandatoryGroups: ["unfilled", "filled", "noSubRequired", "closed"],
  },
  positionType: {
    grouper: d => d.positionType?.name,
    labeller: k => (k == "undefined" ? "Undefined Position Type" : k),
  },
  school: {
    grouper: d =>
      d.locations?.length == 1
        ? d.locations[0].name
        : d.locations?.length
        ? "Multiple Schools"
        : undefined,
    labeller: k => (k == "undefined" ? "Undefined School" : k),
  },
};

/**
 * Helper function to group, format, and sort Details into DetailGroups
 * @param details  A list of details to arrange into groups
 * @param grouper  A function to categorize the details by; passed as the second argument to lodash's `groupBy` function
 * @param labeller  A function that maps the groups generated by grouper to a human-readable form.
 * @param sorter  If present, the compareFunction used to sort the detailGroups their labels.
 */
export function labelledGroupBy(
  details: Detail[],
  // grouper's type is inherited from _.groupBy. The `unknown` type is the most generic type that can be safely checked for equality
  grouper: (d: Detail) => unknown,
  labeller?: (key: string) => string,
  // Sorter is passed to array's sort method, so if it returns a negative value, key1 goes before key2; positive, key2 before key1; zero, leave them in their original order.
  sorter?: (key1: string, key2: string) => number,
  mandatoryGroups?: string[]
): DetailGroup[] {
  const rawGroups = groupBy(details, grouper);
  (mandatoryGroups ?? []).forEach(group => {
    if (!(group in rawGroups)) rawGroups[group] = [];
  });
  const detailGroups = Object.entries(rawGroups).map(([key, value]) => ({
    label: labeller ? labeller(key) : key,
    details: value,
  }));
  return sorter
    ? detailGroups.sort((dG1, dG2) => sorter(dG1.label, dG2.label))
    : detailGroups;
}

/**
 * Helper function to group, format, and sort Details into DetailGroups
 * @param details  A list of details to arrange into groups
 * @param groupFns: list of argument objects.
 *          The first element of the array will be passed to labelledGroupBy to make groups.
 *          If present, the second element will be used on each resulting group to make subgroups
 *          If present, the third element will be used on each resulting subgroup to make sub-subgroups
 *          ...and so on.
 *          Each element contains the three arguments that are passed to labelledGroupBy along with a list of details; namely:
 *            grouper  A function to categorize the details by; passed as the second argument to lodash's `groupBy` function
 *            labeller  A function that maps the groups generated by grouper to a human-readable form.
 *            sorter  If present, the compareFunction used to sort the detailGroups their labels.
 */
export const subGroupBy = (
  details: Detail[],
  groupFns: {
    // grouper's type is inherited from _.groupBy. The `unknown` type is the most generic type that can be safely checked for equality
    grouper: (d: Detail) => unknown;
    labeller?: (key: string) => string;
    // Sorter is passed to array's sort method, so if it returns a negative value, key1 goes before key2; positive, key2 before key1; zero, leave them in their original order.
    sorter?: (key1: string, key2: string) => number;
    mandatoryGroups?: string[];
  }[]
) => {
  if (groupFns.length === 0) return [];
  const { grouper, labeller, sorter, mandatoryGroups } = groupFns[0];
  const groups = labelledGroupBy(
    details,
    grouper,
    labeller,
    sorter,
    mandatoryGroups
  );
  groups.forEach(group => {
    // Here for type safety. Since we're in forEach, return just moves on to the next group.
    if (!group.details) return;
    // Recursive call, with the tail of groupFns.
    // _Techically_ could cause stack overflows, but something has gone wrong if we're finding sub-sub-sub-sub-...-sub-groups.
    const subGroups = subGroupBy(group.details, groupFns.slice(1));
    // Don't define group.subGroups if subGroups is empty.
    group.subGroups = subGroups.length === 0 ? undefined : subGroups;
  });
  return groups;
};
