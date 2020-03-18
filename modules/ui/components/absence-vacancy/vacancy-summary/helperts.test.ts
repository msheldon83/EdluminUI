import { buildVacancySummaryInfo } from "./helpers";
import { VacancySummaryDetail } from "./types";

describe("buildVacancySummaryInfo", () => {
  it("Single Day - no assignment", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: undefined,
        vacancyDetailIds: ["1"],
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
      },
    ]);
  });

  it("Single Day - assigned", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["1"],
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
      },
    ]);
  });

  it("Single Day - prearranged", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: {
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["1"],
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
      },
    ]);
  });

  it("Multiple Days - single assignment for all", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/18/2020"),
        startTimeLocal: new Date("3/18/2020 08:00 AM"),
        endTimeLocal: new Date("3/18/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "3",
        date: new Date("3/19/2020"),
        startTimeLocal: new Date("3/19/2020 08:00 AM"),
        endTimeLocal: new Date("3/19/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
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
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["1", "2", "3"],
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
      },
    ]);
  });

  it("Multiple Days - single assignment for all - different pay codes so split", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/18/2020"),
        startTimeLocal: new Date("3/18/2020 08:00 AM"),
        endTimeLocal: new Date("3/18/2020 05:00 PM"),
        payCodeId: "6",
        payCodeName: "Credit",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["1"],
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
      },
      {
        dates: [new Date("2020-03-18T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["2"],
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
      },
    ]);
  });

  it("Multiple Days - no assignment - accounting codes the same, but in different orders", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        locationId: "1000",
        locationName: "Haven Elementary School",
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
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/18/2020"),
        startTimeLocal: new Date("3/18/2020 08:00 AM"),
        endTimeLocal: new Date("3/18/2020 05:00 PM"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [
          {
            accountingCodeId: "2",
            accountingCodeName: "Cash",
            allocation: 0.5,
          },
          {
            accountingCodeId: "1",
            accountingCodeName: "Accounts Payable",
            allocation: 0.5,
          },
        ],
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [
          new Date("2020-03-17T04:00:00.000Z"),
          new Date("2020-03-18T04:00:00.000Z"),
        ],
        assignment: undefined,
        vacancyDetailIds: ["1", "2"],
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
      },
    ]);
  });

  it("Multiple Days - single assignment for all with multiple details on each day", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 12:00 PM"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 12:00 PM"),
        endTimeLocal: new Date("3/17/2020 5:00 PM"),
        locationId: "1001",
        locationName: "Adventure Middle School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "3",
        date: new Date("3/18/2020"),
        startTimeLocal: new Date("3/18/2020 08:00 AM"),
        endTimeLocal: new Date("3/18/2020 12:00 PM"),
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "4",
        date: new Date("3/18/2020"),
        startTimeLocal: new Date("3/18/2020 12:00 PM"),
        endTimeLocal: new Date("3/18/2020 5:00 PM"),
        locationId: "1001",
        locationName: "Adventure Middle School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [
          new Date("2020-03-17T04:00:00.000Z"),
          new Date("2020-03-18T04:00:00.000Z"),
        ],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["1", "2", "3", "4"],
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
      },
    ]);
  });

  it("Multiple Days - split vacancy with single assignment - (M assigned, T unfilled, W assigned)", () => {
    const vacancySummaryDetails: VacancySummaryDetail[] = [
      {
        vacancyId: "1",
        vacancyDetailId: "1",
        date: new Date("3/16/2020"),
        startTimeLocal: new Date("3/16/2020 08:00 AM"),
        endTimeLocal: new Date("3/16/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
      {
        vacancyId: "1",
        vacancyDetailId: "2",
        date: new Date("3/17/2020"),
        startTimeLocal: new Date("3/17/2020 08:00 AM"),
        endTimeLocal: new Date("3/17/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
      },
      {
        vacancyId: "1",
        vacancyDetailId: "3",
        date: new Date("3/18/2020"),
        startTimeLocal: new Date("3/18/2020 08:00 AM"),
        endTimeLocal: new Date("3/18/2020 05:00 PM"),
        payCodeId: "5",
        payCodeName: "Petty Cash",
        locationId: "1000",
        locationName: "Haven Elementary School",
        accountingCodeAllocations: [],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: {
            id: "7",
            firstName: "David",
            lastName: "Nawn",
          },
        },
      },
    ];

    const result = buildVacancySummaryInfo(vacancySummaryDetails);
    expect(result).toStrictEqual([
      {
        dates: [new Date("2020-03-16T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["1"],
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
      },
      {
        dates: [new Date("2020-03-17T04:00:00.000Z")],
        assignment: undefined,
        vacancyDetailIds: ["2"],
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
      },
      {
        dates: [new Date("2020-03-18T04:00:00.000Z")],
        assignment: {
          id: "3",
          rowVersion: "34536346",
          employee: { id: "7", firstName: "David", lastName: "Nawn" },
        },
        vacancyDetailIds: ["3"],
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
      },
    ]);
  });
});
