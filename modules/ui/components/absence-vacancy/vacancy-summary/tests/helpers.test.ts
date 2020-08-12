import {
  buildAssignmentGroups,
  convertVacancyDetailsFormDataToVacancySummaryDetails,
  vacancySummaryDetailsAreEqual,
  convertToAssignmentWithDetails,
} from "../helpers";
import { AssignmentGroupTestCases } from "./testCases";
import {
  VacancySummaryDetail,
  DateDetail,
  VacancySummaryDetailByAssignmentAndDate,
} from "../types";
import { VacancyDetailsFormData } from "ui/pages/vacancy/helpers/types";
import { isSameDay } from "date-fns";

describe("convertVacancyDetailsFormDataToVacancySummaryDetails", () => {
  it("Basic Vacancy - single day - no assignments", () => {
    const vacancyFormData: VacancyDetailsFormData = {
      id: "100345",
      isClosed: false,
      rowVersion: "34255463666754",
      positionTypeId: "1",
      title: "Vacancy Title",
      contractId: "2",
      locationId: "3",
      locationName: "Haven Elementary School",
      workDayScheduleId: "4",
      orgId: "1038",
      closedDetails: [],
      details: [
        {
          id: "1000",
          isClosed: false,
          date: new Date("2020-03-23T04:00:00.000Z"),
          startTime: 34200,
          endTime: 54900,
          locationId: "3",
          vacancyReasonId: "7",
        },
      ],
    };

    const result = convertVacancyDetailsFormDataToVacancySummaryDetails(
      vacancyFormData
    );
    expect(result).toStrictEqual([
      {
        vacancyId: "100345",
        vacancyDetailId: "1000",
        date: new Date("2020-03-23T04:00:00.000Z"),
        startTimeLocal: new Date("2020-03-23T09:30:00.000"),
        endTimeLocal: new Date("2020-03-23T15:15:00.000"),
        payCodeId: undefined,
        payCodeName: undefined,
        locationId: "3",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: undefined,
      },
    ]);
  });

  it("Basic Vacancy - single day with assignment", () => {
    const vacancyFormData: VacancyDetailsFormData = {
      id: "100345",
      rowVersion: "34255463666754",
      isClosed: false,
      positionTypeId: "1",
      title: "Vacancy Title",
      contractId: "2",
      locationId: "3",
      locationName: "Haven Elementary School",
      workDayScheduleId: "4",
      orgId: "1038",
      closedDetails: [],
      details: [
        {
          id: "1000",
          date: new Date("2020-03-23T04:00:00.000Z"),
          isClosed: false,
          startTime: 34200,
          endTime: 54900,
          locationId: "3",
          vacancyReasonId: "7",
          assignment: {
            id: "2000",
            rowVersion: "3543456346",
            employee: {
              id: "3000",
              firstName: "David",
              lastName: "Nawn",
              email: "dnawn@redroverk12.com"
            },
          },
        },
      ],
    };

    const result = convertVacancyDetailsFormDataToVacancySummaryDetails(
      vacancyFormData
    );
    expect(result).toStrictEqual([
      {
        vacancyId: "100345",
        vacancyDetailId: "1000",
        date: new Date("2020-03-23T04:00:00.000Z"),
        startTimeLocal: new Date("2020-03-23T09:30:00.000"),
        endTimeLocal: new Date("2020-03-23T15:15:00.000"),
        payCodeId: undefined,
        payCodeName: undefined,
        locationId: "3",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "2000",
          rowVersion: "3543456346",
          employee: {
            id: "3000",
            firstName: "David",
            lastName: "Nawn",
            email: "dnawn@redroverk12.com"
          },
        },
      },
    ]);
  });

  it("Complex Vacancy - multiple days with assignments, pay codes, and accounting codes", () => {
    const vacancyFormData: VacancyDetailsFormData = {
      id: "100345",
      rowVersion: "34255463666754",
      isClosed: false,
      closedDetails: [],
      positionTypeId: "1",
      title: "Vacancy Title",
      contractId: "2",
      locationId: "3",
      locationName: "Haven Elementary School",
      workDayScheduleId: "4",
      orgId: "1038",
      details: [
        {
          id: "1000",
          date: new Date("2020-03-23T04:00:00.000Z"),
          isClosed: false,
          startTime: 34200,
          endTime: 54900,
          locationId: "3",
          vacancyReasonId: "7",
          payCodeId: "800",
          payCodeName: "Time and a half",
          accountingCodeAllocations: [
            {
              accountingCodeId: "900",
              accountingCodeName: "Accounts Payable",
              allocation: 1.0,
            },
          ],
          assignment: {
            id: "2000",
            rowVersion: "3543456346",
            employee: {
              id: "3000",
              firstName: "David",
              lastName: "Nawn",
              email: "dnawn@redroverk12.com"
            },
          },
        },
        {
          id: "1001",
          date: new Date("2020-03-24T04:00:00.000Z"),
          isClosed: false,
          startTime: 34200,
          endTime: 54900,
          locationId: "3",
          vacancyReasonId: "7",
          payCodeId: "801",
          payCodeName: "Double Time",
          accountingCodeAllocations: [
            {
              accountingCodeId: "901",
              accountingCodeName: "Cash",
              allocation: 1.0,
            },
          ],
          assignment: {
            id: "2001",
            rowVersion: "67547667",
            employee: {
              id: "3001",
              firstName: "John",
              lastName: "Smith",
              email: "jsmith@test.com"
            },
          },
        },
      ],
    };

    const result = convertVacancyDetailsFormDataToVacancySummaryDetails(
      vacancyFormData
    );
    expect(result).toStrictEqual([
      {
        vacancyId: "100345",
        vacancyDetailId: "1000",
        date: new Date("2020-03-23T04:00:00.000Z"),
        startTimeLocal: new Date("2020-03-23T09:30:00.000"),
        endTimeLocal: new Date("2020-03-23T15:15:00.000"),
        locationId: "3",
        locationName: "Haven Elementary School",
        payCodeId: "800",
        payCodeName: "Time and a half",
        accountingCodeAllocations: [
          {
            accountingCodeId: "900",
            accountingCodeName: "Accounts Payable",
            allocation: 1.0,
          },
        ],
        assignment: {
          id: "2000",
          rowVersion: "3543456346",
          employee: {
            id: "3000",
            firstName: "David",
            lastName: "Nawn",
            email: "dnawn@redroverk12.com"
          },
        },
      },
      {
        vacancyId: "100345",
        vacancyDetailId: "1001",
        date: new Date("2020-03-24T04:00:00.000Z"),
        startTimeLocal: new Date("2020-03-24T09:30:00.000"),
        endTimeLocal: new Date("2020-03-24T15:15:00.000"),
        locationId: "3",
        locationName: "Haven Elementary School",
        payCodeId: "801",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "901",
            accountingCodeName: "Cash",
            allocation: 1.0,
          },
        ],
        assignment: {
          id: "2001",
          rowVersion: "67547667",
          employee: {
            id: "3001",
            firstName: "John",
            lastName: "Smith",
            email: "jsmith@test.com"
          },
        },
      },
    ]);
  });
});

describe("buildAssignmentGroups", () => {
  it("Single Day - no assignment", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.singleDayNoAssignment;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: undefined,
        vacancyDetailIds: ["1"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails,
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Single Day - assigned", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.singleDayWithAssignment;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["1"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails,
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Single Day - prearranged", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.singleDayPrearranged;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: {
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["1"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails,
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Multiple Days - single assignment for all", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.multipleDaysSingleAssignmentForAll;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [
          new Date("2020-03-17T04:00:00.000Z"),
          new Date("2020-03-18T04:00:00.000Z"),
          new Date("2020-03-19T04:00:00.000Z"),
        ],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["1", "2", "3"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
          {
            date: new Date("2020-03-18T04:00:00.000Z"),
            vacancyDetailIds: ["2"],
          },
          {
            date: new Date("2020-03-19T04:00:00.000Z"),
            vacancyDetailIds: ["3"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails,
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Multiple Days - single assignment for all - different pay codes so split", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.multipleDaysSingleAssignmentForAllDifferentPayCodes;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["1"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails.filter(vsd =>
          isSameDay(vsd.date, new Date("2020-03-17T04:00:00.000Z"))
        ),
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
      {
        dates: [new Date("2020-03-18T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["2"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-18T04:00:00.000Z"),
            vacancyDetailIds: ["2"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-18T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "6",
            payCodeName: "Credit",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails.filter(vsd =>
          isSameDay(vsd.date, new Date("2020-03-18T04:00:00.000Z"))
        ),
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Multiple Days - no assignment - accounting codes the same, but in different orders", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.multipleDaysNoAssignmentAccountingCodesInDifferentOrder;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [
          new Date("2020-03-17T04:00:00.000Z"),
          new Date("2020-03-18T04:00:00.000Z"),
        ],
        assignment: undefined,
        vacancyDetailIds: ["1", "2"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
          {
            date: new Date("2020-03-18T04:00:00.000Z"),
            vacancyDetailIds: ["2"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: undefined,
            payCodeName: undefined,
            accountingCodeAllocations: [
              {
                accountingCodeId: "1",
                accountingCodeName: "Accounts Payable",
                allocation: 0.5,
              },
              {
                accountingCodeId: "2",
                accountingCodeName: "Cash",
                allocation: 0.5,
              },
            ],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails,
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Multiple Days - single assignment for all with multiple details on each day", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.multipleDaysSingleAssignmentForAllWithMultipleDetailsPerDay;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [
          new Date("2020-03-17T04:00:00.000Z"),
          new Date("2020-03-18T04:00:00.000Z"),
        ],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn",email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["1", "2", "3", "4"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["1", "2"],
          },
          {
            date: new Date("2020-03-18T04:00:00.000Z"),
            vacancyDetailIds: ["3", "4"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "12:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: undefined,
            payCodeName: undefined,
            accountingCodeAllocations: [],
          },
          {
            startTime: "12:00 PM",
            endTime: "5:00 PM",
            locationId: "1001",
            locationName: "Adventure Middle School",
            payCodeId: undefined,
            payCodeName: undefined,
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails,
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });

  it("Multiple Days - split vacancy with single assignment - (M assigned, T unfilled, W assigned)", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] =
      AssignmentGroupTestCases.multipleDaysSplitVacancyWithSingleAssignment;

    const result = buildAssignmentGroups(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-16T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["1"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-16T04:00:00.000Z"),
            vacancyDetailIds: ["1"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-16T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails.filter(vsd =>
          isSameDay(vsd.date, new Date("2020-03-16T04:00:00.000Z"))
        ),
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: undefined,
        vacancyDetailIds: ["2"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-17T04:00:00.000Z"),
            vacancyDetailIds: ["2"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-17T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails.filter(vsd =>
          isSameDay(vsd.date, new Date("2020-03-17T04:00:00.000Z"))
        ),
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
      {
        dates: [new Date("2020-03-18T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn", email: "dnawn@redroverk12.com" },
        },
        vacancyDetailIds: ["3"],
        vacancyDetailIdsByDate: [
          {
            date: new Date("2020-03-18T04:00:00.000Z"),
            vacancyDetailIds: ["3"],
          },
        ],
        startDateAndTimeLocal: new Date("2020-03-18T08:00:00.000"),
        details: [
          {
            startTime: "8:00 AM",
            endTime: "5:00 PM",
            locationId: "1000",
            locationName: "Haven Elementary School",
            payCodeId: "5",
            payCodeName: "Petty Cash",
            accountingCodeAllocations: [],
          },
        ],
        vacancySummaryDetails: vacancySummaryDetails.filter(vsd =>
          isSameDay(vsd.date, new Date("2020-03-18T04:00:00.000Z"))
        ),
        absenceStartTime: undefined,
        absenceEndTime: undefined,
      },
    ]);
  });
});

describe("vacancySummaryDetailsAreEqual", () => {
  it("Different number of details - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
      },
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1001",
        locationName: "Adventure Elementary School",
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("Different start times - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:01 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("Different end times - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:01 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("Different locations - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1001",
        locationName: "Adventure Elementary School",
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("Different pay codes - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2001",
        payCodeName: "Time and a half",
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("Different accounting codes - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5001",
            accountingCodeName: "Cash",
            allocation: 1.0,
          },
        ],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 1.0,
          },
        ],
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("Different accounting code allocations - not equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 0.25,
          },
          {
            accountingCodeId: "5001",
            accountingCodeName: "Cash",
            allocation: 0.75,
          },
        ],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 0.45,
          },
          {
            accountingCodeId: "5001",
            accountingCodeName: "Cash",
            allocation: 0.55,
          },
        ],
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(false);
  });

  it("All details the same - equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 1.0,
          },
        ],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 1.0,
          },
        ],
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(true);
  });

  it("All details the same - accounting codes in different orders - equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 0.5,
          },
          {
            accountingCodeId: "5001",
            accountingCodeName: "Cash",
            allocation: 0.5,
          },
        ],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "5:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
        payCodeId: "2000",
        payCodeName: "Double Time",
        accountingCodeAllocations: [
          {
            accountingCodeId: "5001",
            accountingCodeName: "Cash",
            allocation: 0.5,
          },
          {
            accountingCodeId: "5000",
            accountingCodeName: "Accounts Payable",
            allocation: 0.5,
          },
        ],
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(true);
  });

  it("All details the same - multiple details - equal", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T08:00:00.000"),
        endTimeLocal: new Date("2020-03-17T12:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("2020-03-17T12:00:00.000"),
        endTimeLocal: new Date("2020-03-17T17:00:00.000"),
        locationId: "1001",
        locationName: "Adventure Middle School",
        accountingCodeAllocations: [],
      },
    ];
    const assignmentDetails: DateDetail[] = [
      {
        startTime: "8:00 AM",
        endTime: "12:00 PM",
        locationId: "1000",
        locationName: "Haven Elementary School",
      },
      {
        startTime: "12:00 PM",
        endTime: "5:00 PM",
        locationId: "1001",
        locationName: "Adventure Middle School",
      },
    ];

    const result = vacancySummaryDetailsAreEqual(
      assignmentDetails,
      vacancySummaryDetails
    );
    expect(result).toBe(true);
  });
});

describe("convertToAssignmentWithDetails", () => {
  it("Single Detail - mapped correctly", () => {
    const vacancySummaryDetails = [
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/23/2020"),
        startTimeLocal: new Date("2020-03-23T10:00:00.000"),
        endTimeLocal: new Date("2020-03-23T17:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
    ];
    const summaryDetailsByAssignmentAndDate: VacancySummaryDetailByAssignmentAndDate = {
      assignmentId: undefined,
      employeeId: undefined,
      date: new Date("3/23/2020"),
      startDateAndTimeLocal: new Date("2020-03-23T10:00:00.000"),
      details: vacancySummaryDetails,
    };

    const result = convertToAssignmentWithDetails(
      summaryDetailsByAssignmentAndDate
    );
    expect(result).toStrictEqual({
      dates: [new Date("3/23/2020")],
      startDateAndTimeLocal: new Date("2020-03-23T10:00:00.000"),
      assignment: undefined,
      vacancyDetailIds: ["2"],
      vacancyDetailIdsByDate: [
        {
          date: new Date("3/23/2020"),
          vacancyDetailIds: ["2"],
        },
      ],
      details: [
        {
          startTime: "10:00 AM",
          endTime: "5:00 PM",
          locationId: "1000",
          locationName: "Haven Elementary School",
          payCodeId: undefined,
          payCodeName: undefined,
          accountingCodeAllocations: [],
        },
      ],
      vacancySummaryDetails: vacancySummaryDetails,
      absenceStartTime: undefined,
      absenceEndTime: undefined,
    });
  });

  it("Multiple Details - mapped correctly", () => {
    const vacancySummaryDetails = [
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/23/2020"),
        startTimeLocal: new Date("2020-03-23T10:00:00.000"),
        endTimeLocal: new Date("2020-03-23T12:00:00.000"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "2000",
          rowVersion: "3425254",
          employee: {
            id: "3000",
            firstName: "John",
            lastName: "Smith",
            email: "jSmith@test.com"
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "3",
        date: new Date("3/23/2020"),
        startTimeLocal: new Date("2020-03-23T12:00:00.000"),
        endTimeLocal: new Date("2020-03-23T17:00:00.000"),
        locationId: "1001",
        locationName: "Adventure Middle School",
        accountingCodeAllocations: [],
        assignment: {
          id: "2000",
          rowVersion: "3425254",
          employee: {
            id: "3000",
            firstName: "John",
            lastName: "Smith",
            email: "jSmith@test.com"
          },
        },
      },
    ];
    const summaryDetailsByAssignmentAndDate: VacancySummaryDetailByAssignmentAndDate = {
      assignmentId: "2000",
      employeeId: "3000",
      date: new Date("3/23/2020"),
      startDateAndTimeLocal: new Date("2020-03-23T10:00:00.000"),
      details: vacancySummaryDetails,
    };

    const result = convertToAssignmentWithDetails(
      summaryDetailsByAssignmentAndDate
    );
    expect(result).toStrictEqual({
      dates: [new Date("3/23/2020")],
      startDateAndTimeLocal: new Date("2020-03-23T10:00:00.000"),
      assignment: {
        id: "2000",
        rowVersion: "3425254",
        employee: {
          id: "3000",
          firstName: "John",
          lastName: "Smith",
          email: "jSmith@test.com"
        },
      },
      vacancyDetailIds: ["2", "3"],
      vacancyDetailIdsByDate: [
        {
          date: new Date("3/23/2020"),
          vacancyDetailIds: ["2", "3"],
        },
      ],
      details: [
        {
          startTime: "10:00 AM",
          endTime: "12:00 PM",
          locationId: "1000",
          locationName: "Haven Elementary School",
          payCodeId: undefined,
          payCodeName: undefined,
          accountingCodeAllocations: [],
        },
        {
          startTime: "12:00 PM",
          endTime: "5:00 PM",
          locationId: "1001",
          locationName: "Adventure Middle School",
          payCodeId: undefined,
          payCodeName: undefined,
          accountingCodeAllocations: [],
        },
      ],
      vacancySummaryDetails: vacancySummaryDetails,
      absenceStartTime: undefined,
      absenceEndTime: undefined,
    });
  });
});
