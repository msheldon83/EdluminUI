import { format, parseISO, isEqual } from "date-fns";
import {
  AbsenceDetail,
  VacancyDetail,
  DailyReport as DailyReportType,
  Vacancy,
  Maybe,
} from "graphql/server-types.gen";
import { flatMap } from "lodash-es";

export type CardType =
  | "unfilled"
  | "filled"
  | "noSubRequired"
  | "total"
  | "awaitingVerification";

export type Detail = {
  id: string;
  state: "unfilled" | "filled" | "noSubRequired";
  type: "absence" | "vacancy";
  employee?: {
    id: string;
    name: string;
  };
  absenceReason?: string;
  date: Date;
  dateRange: string;
  startTime: string;
  endTime: string;
  created: Date;
  substitute?: {
    id: string;
    name: string;
    phone: string;
  };
  position?: {
    id: string;
    name: string;
  };
  location?: {
    id: string;
    name: string;
  };
};

export const MapDailyReportDetails = (
  dailyReport: DailyReportType,
  date: Date
): Detail[] => {
  const details: Detail[] = [];

  // Filled Absences
  const filledAbsencesDetails = flatMap(dailyReport.filledAbsences, a => {
    if (!a || !a.details) {
      return [];
    }

    return a.details.map(d => {
      const absenceDetail = d as AbsenceDetail;
      const matchingVacancyDetail = getMatchingVacancyDetail(
        absenceDetail,
        a.vacancies
      );

      return {
        id: a.id,
        state: "filled",
        type: "absence",
        employee: a.employee
          ? {
              id: a.employee.id,
              name: `${a.employee.firstName} ${a.employee.lastName}`,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages![0]?.absenceReason?.name,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(
          absenceDetail.startDate,
          absenceDetail.endDate
        ),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: a.createdUtc,
        substitute:
          matchingVacancyDetail &&
          matchingVacancyDetail.assignment &&
          matchingVacancyDetail.assignment.employee
            ? {
                id: matchingVacancyDetail.assignment.employee.id,
                name: `${matchingVacancyDetail.assignment.employee.firstName} ${matchingVacancyDetail.assignment.employee.lastName}`,
                phone: matchingVacancyDetail.assignment.employee.phoneNumber,
              }
            : undefined,
        position:
          a.vacancies && a.vacancies[0] && a.vacancies[0].position
            ? {
                id: a.vacancies[0].position.id,
                name: a.vacancies[0].position.name,
              }
            : undefined,
        location:
          matchingVacancyDetail && matchingVacancyDetail.location
            ? {
                id: matchingVacancyDetail.location.id,
                name: matchingVacancyDetail.location.name,
              }
            : undefined,
      } as Detail;
    });
  });
  // Add in getting the Sub for the appropriate Absence Detail > Vacancy Detail match
  details.push(...filledAbsencesDetails);

  // Filled Vacancies
  const filledVacancyDetails = flatMap(dailyReport.filledVacancies, v => {
    if (!v || !v.details) {
      return [];
    }

    return v.details.map(d => {
      const vacancyDetail = d as VacancyDetail;
      return {
        id: v.id,
        state: "filled",
        type: "vacancy",
        date: parseISO(vacancyDetail.startDate),
        dateRange: getRangeDisplayText(
          vacancyDetail.startDate,
          vacancyDetail.endDate
        ),
        startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
        created: v.createdUtc,
        substitute:
          vacancyDetail.assignment && vacancyDetail.assignment.employee
            ? {
                id: vacancyDetail.assignment.employee.id,
                name: `${vacancyDetail.assignment.employee.firstName} ${vacancyDetail.assignment.employee.lastName}`,
                phone: vacancyDetail.assignment.employee.phoneNumber,
              }
            : undefined,
        position: v.position
          ? {
              id: v.position.id,
              name: v.position.name,
            }
          : undefined,
        location: vacancyDetail.location
          ? {
              id: vacancyDetail.location.id,
              name: vacancyDetail.location.name,
            }
          : undefined,
      } as Detail;
    });
  });
  details.push(...filledVacancyDetails);

  // Unfilled Absences
  const unfilledAbsencesDetails = flatMap(dailyReport.unfilledAbsences, a => {
    if (!a || !a.details) {
      return [];
    }

    return a.details.map(d => {
      const absenceDetail = d as AbsenceDetail;
      const matchingVacancyDetail = getMatchingVacancyDetail(
        absenceDetail,
        a.vacancies
      );

      return {
        id: a.id,
        state: "unfilled",
        type: "absence",
        employee: a.employee
          ? {
              id: a.employee.id,
              name: `${a.employee.firstName} ${a.employee.lastName}`,
            }
          : undefined,
        absenceReason: absenceDetail.reasonUsages![0]?.absenceReason?.name,
        date: parseISO(absenceDetail.startDate),
        dateRange: getRangeDisplayText(
          absenceDetail.startDate,
          absenceDetail.endDate
        ),
        startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
        created: a.createdUtc,
        position:
          a.vacancies && a.vacancies[0] && a.vacancies[0].position
            ? {
                id: a.vacancies[0].position.id,
                name: a.vacancies[0].position.name,
              }
            : undefined,
        location:
          matchingVacancyDetail && matchingVacancyDetail.location
            ? {
                id: matchingVacancyDetail.location.id,
                name: matchingVacancyDetail.location.name,
              }
            : undefined,
      } as Detail;
    });
  });
  details.push(...unfilledAbsencesDetails);

  // Unfilled Vacancies
  const unfilledVacancyDetails = flatMap(dailyReport.filledVacancies, v => {
    if (!v || !v.details) {
      return [];
    }

    return v.details.map(d => {
      const vacancyDetail = d as VacancyDetail;
      return {
        id: v.id,
        state: "unfilled",
        type: "vacancy",
        date: parseISO(vacancyDetail.startDate),
        dateRange: getRangeDisplayText(
          vacancyDetail.startDate,
          vacancyDetail.endDate
        ),
        startTime: format(parseISO(vacancyDetail.startTimeLocal), "h:mm a"),
        endTime: format(parseISO(vacancyDetail.endTimeLocal), "h:mm a"),
        created: v.createdUtc,
        position: v.position
          ? {
              id: v.position.id,
              name: v.position.name,
            }
          : undefined,
        location: vacancyDetail.location
          ? {
              id: vacancyDetail.location.id,
              name: vacancyDetail.location.name,
            }
          : undefined,
      } as Detail;
    });
  });
  details.push(...unfilledVacancyDetails);

  // No Sub Required Absences
  const noSubRequiredAbsencesDetails = flatMap(
    dailyReport.noSubRequiredAbsences,
    a => {
      if (!a || !a.details) {
        return [];
      }

      return a.details.map(d => {
        const absenceDetail = d as AbsenceDetail;
        return {
          id: a.id,
          state: "noSubRequired",
          type: "absence",
          employee: a.employee
            ? {
                id: a.employee.id,
                name: `${a.employee.firstName} ${a.employee.lastName}`,
              }
            : undefined,
          absenceReason: absenceDetail.reasonUsages![0]?.absenceReason?.name,
          date: parseISO(absenceDetail.startDate),
          dateRange: getRangeDisplayText(
            absenceDetail.startDate,
            absenceDetail.endDate
          ),
          startTime: format(parseISO(absenceDetail.startTimeLocal), "h:mm a"),
          endTime: format(parseISO(absenceDetail.endTimeLocal), "h:mm a"),
          created: a.createdUtc,
        } as Detail;
      });
    }
  );
  details.push(...noSubRequiredAbsencesDetails);

  // Filter the list by only details that match the Date we are looking for
  const detailsForDate = details.filter(x => isEqual(x.date, date));

  return detailsForDate;
};

const getRangeDisplayText = (startDate: string, endDate: string): string => {
  const startDateAsDate = parseISO(startDate);
  const endDateAsDate = parseISO(endDate);

  if (
    startDateAsDate.getDay() === endDateAsDate.getDay() &&
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

const getMatchingVacancyDetail = (
  absenceDetail: AbsenceDetail,
  vacancies: Maybe<Vacancy>[] | null | undefined
): VacancyDetail | null | undefined => {
  if (!vacancies) {
    return undefined;
  }

  const allVacancyDetails = flatMap(vacancies, v => v!.details);
  const matchingVacancyDetail = allVacancyDetails.find(
    d => d && isEqual(parseISO(d.startDate), parseISO(absenceDetail.startDate))
  );
  return matchingVacancyDetail;
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
