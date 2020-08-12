export const AssignmentGroupTestCases = {
  singleDayNoAssignment: [
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
  ],
  singleDayWithAssignment: [
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
          email: "dnawn@redroverk12.com"
        },
      },
    },
  ],
  singleDayPrearranged: [
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
          email: "dnawn@redroverk12.com"
        },
      },
    },
  ],
  multipleDaysSingleAssignmentForAll: [
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
        },
      },
    },
  ],
  multipleDaysSingleAssignmentForAllDifferentPayCodes: [
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
        },
      },
    },
  ],
  multipleDaysNoAssignmentAccountingCodesInDifferentOrder: [
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
  ],
  multipleDaysSingleAssignmentForAllWithMultipleDetailsPerDay: [
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
        },
      },
    },
  ],
  multipleDaysSplitVacancyWithSingleAssignment: [
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
          email: "dnawn@redroverk12.com"
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
          email: "dnawn@redroverk12.com"
        },
      },
    },
  ],
};
