import { mergeCatgoriesAndReasons } from "../helpers";

const absReasons = [
  {
    id: "1",
    name: "reason 1",
    rowVersion: "",
    expired: false,
    allowNegativeBalance: false,
    isRestricted: false,
    requiresApproval: true,
  },
  {
    id: "2",
    name: "reason 2",
    rowVersion: "",
    expired: false,
    allowNegativeBalance: false,
    isRestricted: false,
    requiresApproval: true,
  },
  {
    id: "3",
    name: "reason 3",
    rowVersion: "",
    expired: false,
    allowNegativeBalance: false,
    isRestricted: false,
    requiresApproval: true,
  },
  {
    id: "4",
    name: "reason 4",
    rowVersion: "",
    expired: false,
    allowNegativeBalance: false,
    isRestricted: false,
    requiresApproval: false,
  },
];

describe("mergeCatgoriesAndReasons", () => {
  it("no categories", () => {
    const result = mergeCatgoriesAndReasons([], absReasons);

    expect(result).toStrictEqual([
      {
        id: "0",
        name: "Uncategorized",
        orgId: "",
        rowVersion: "",
        children: [
          {
            id: "1",
            name: "reason 1",
            externalId: "",
            isCategory: false,
            trackingType: "",
            allowNegativeBalance: false,
            orgId: "",
            rowVersion: "",
          },
          {
            id: "2",
            name: "reason 2",
            externalId: "",
            isCategory: false,
            trackingType: "",
            allowNegativeBalance: false,
            orgId: "",
            rowVersion: "",
          },
          {
            id: "3",
            name: "reason 3",
            externalId: "",
            isCategory: false,
            trackingType: "",
            allowNegativeBalance: false,
            orgId: "",
            rowVersion: "",
          },
          {
            id: "4",
            name: "reason 4",
            externalId: "",
            isCategory: false,
            trackingType: "",
            allowNegativeBalance: false,
            orgId: "",
            rowVersion: "",
          },
        ],
      },
    ]);
  });
});
