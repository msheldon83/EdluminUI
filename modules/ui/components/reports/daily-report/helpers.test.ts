import * as fc from "fast-check";
import { GroupOption, groupOptions } from "./filters/filter-params";
import {
  Detail,
  DetailGroup,
  groupDictionary,
  labelledGroupBy,
  subGroupBy,
} from "./helpers";
import { ApprovalStatus } from "graphql/server-types.gen";

// natString is a _revolutionary_ function that...
const natString = fc
  //...generates a natural number...
  .nat()
  // ...and turns it into a string.
  .map(n => n.toString());
// fc.option returns nulls, which isn't going to work with strict null checks, so we have optional.
const optional: <T>(
  // It takes in a generator that makes arbitrary T...
  arb: fc.Arbitrary<T>
) => // ...and returns a generator that makes T or undefined
fc.Arbitrary<T | undefined> = arb => fc.option(arb).map(a => a ?? undefined);

type DetailSkeleton = {
  [key in keyof Detail]: fc.Arbitrary<Detail[key]>;
};

// arbitraryDetailField descibes how to (separately) generate each field of a Detail.
const arbitraryDetailFields: Required<DetailSkeleton> = {
  // ids are natural strings, naturally.
  id: natString,
  detailId: natString,
  orgId: natString,
  // fc.constantFrom randomly picks one of the provided constant values.
  state: fc.constantFrom("unfilled", "filled", "noSubRequired", "closed"),
  type: fc.constantFrom("absence", "vacancy"),
  absenceRowVersion: optional(natString),
  vacancyRowVersion: optional(natString),
  vacancyId: optional(natString),
  employee: optional(
    // fc.record generates objects in the shape of a blueprint, which itself has
    // generator values.
    fc.record({
      id: natString,
      name: fc.string(),
      lastName: fc.string(),
    })
  ),
  absenceReason: optional(fc.string()),
  vacancyReason: optional(fc.string()),
  // fc.date does what you think.
  date: fc.date(),
  // We _could_ be more specific with the date and time strings,
  // but it's not as simple to do as making natural strings,
  // and we're not doing anything with these atm.
  dateRange: fc.string(),
  startTime: fc.string(),
  endTime: fc.string(),
  created: fc.string(),
  isMultiDay: fc.boolean(),
  isClosed: fc.boolean(),
  substitute: optional(
    fc.record({
      id: natString,
      name: fc.string(),
      phone: fc.string(),
    })
  ),
  subTimes: fc.array(
    fc.record({
      startTime: fc.string(),
      endTime: fc.string(),
    })
  ),
  assignmentId: optional(natString),
  assignmentRowVersion: optional(natString),
  position: optional(
    fc.record({
      id: optional(natString),
      title: fc.string(),
      name: fc.string(),
    })
  ),
  positionType: optional(
    fc.record({
      id: natString,
      name: fc
        .string()
        // While __highly__ unlikely, we don't want the name to be "Undefined Position Type" or "undefined",
        // as both would mess with undefined position types. Easily handled, so might as well.
        .map(n =>
          ["Undefined Position Type", "undefined"].includes(n)
            ? "Whadda the odds?"
            : n
        ),
    })
  ),
  location: optional(
    fc.record({
      id: optional(natString),
      name: fc
        .string()
        // While __highly__ unlikely, we don't want the name to be "Undefined School" or "undefined",
        // as both would mess with undefined locations. Easily handled, so might as well.
        .map(n =>
          ["Undefined School", "undefined"].includes(n) ? "Whadda the odds?" : n
        ),
    })
  ),
  approvalStatus: optional(
    fc.constantFrom(
      ApprovalStatus.PartiallyApproved,
      ApprovalStatus.ApprovalRequired,
      ApprovalStatus.Approved,
      ApprovalStatus.Denied
    )
  ),
};

// arbitraryDetail uses arbitraryDetailFields to actually construct arbitrary Details
const arbitraryDetail: (
  // the overides argument allows us to replace some generators;
  // used later for passing in a fixed list of locations or positionTypes.
  overides?: Partial<DetailSkeleton>
) => fc.Arbitrary<Detail> = overides =>
  fc.record({ ...arbitraryDetailFields, ...overides });

// Generates 1-4 different positionTypes.
const presetPositionTypes = fc.set(
  arbitraryDetailFields.positionType,
  1,
  4,
  // The code expects unique names, so this function uses that as the set equality test.
  (positionTypeA, positionTypeB) => positionTypeA?.name == positionTypeB?.name
);

// Generate 1-4 different locations.
const presetSchools = fc.set(
  arbitraryDetailFields.location,
  1,
  4,
  // The code expects unique names, so this function uses that as the set equality test.
  (locationA, locationB) => locationA?.name == locationB?.name
);

describe("labelledGroupBy", () => {
  it("groups, labels, and sorts by fill status", () => {
    // We only need to define these once, so they're outside of fc.assert
    const labelMap = [
      {
        internal: "unfilled",
        external: "Unfilled",
      },
      {
        internal: "filled",
        external: "Filled",
      },
      {
        internal: "noSubRequired",
        external: "No sub required",
      },
      {
        internal: "closed",
        external: "Closed",
      },
    ];
    const properOrder = labelMap.map(l => l.external);
    const {
      grouper,
      labeller,
      sorter,
      mandatoryGroups,
    } = groupDictionary.fillStatus;

    // fc.assert runs a property against random data, multiple times (100 times by default)
    fc.assert(
      // fc.property describes random data, and tests that should succeed against it.
      fc.property(
        // First argument to fc.property is the random data to generate.
        // This line can be read as: "generate an array of arbitraryDetails, of length 2 to 20."
        fc.array(arbitraryDetail(), 2, 20),
        // This describes the test to run, taking in the generated details as its argument
        details => {
          const groups = labelledGroupBy(
            details,
            grouper,
            labeller,
            sorter,
            mandatoryGroups
          );

          expect(groups.map(g => g.label)).toEqual(
            labelMap.map(l => l.external)
          );
          groups.forEach((group, ind) => {
            expect(properOrder).toContain(group.label);
            if (ind + 1 < groups.length) {
              expect(properOrder.indexOf(group.label)).toBeLessThan(
                properOrder.indexOf(groups[ind + 1].label)
              );
            }
            const { internal } = labelMap.find(l => l.external == group.label)!;
            expect(group.details).not.toBeUndefined();
            group.details!.forEach(detail => {
              expect(detail.state).toEqual(internal);
            });
          });
        }
      )
    );
  });

  it("groups by position type", () => {
    const {
      grouper,
      labeller,
      sorter,
      mandatoryGroups,
    } = groupDictionary.positionType;
    fc.assert(
      fc.property(
        // The chain method lets us use the results of one generator to create another.
        // In this case, we create some predefined positionTypes, and use them to create details.
        presetPositionTypes.chain(positionTypes =>
          fc
            // We're making an array of...
            .array(
              //...arbitraryDetails, with their positionTypes selected from the above,...
              arbitraryDetail({
                positionType: fc.constantFrom(...positionTypes),
              }),
              //...2 to 20 details long.
              2,
              20
            )
            // We're also passing along the positionTypes we generated, for reference.
            .map(details => ({
              positionTypes,
              details,
            }))
        ),
        ({ positionTypes, details }) => {
          const groups = labelledGroupBy(
            details,
            grouper,
            labeller,
            sorter,
            mandatoryGroups
          );

          groups.forEach((group, ind) => {
            // Make sure nothing's gone wrong with the arbitrary.
            let internal: string | undefined = undefined;
            if (group.label == "Undefined Position Type") {
              expect(positionTypes.map(l => typeof l)).toContain("undefined");
            } else {
              expect(positionTypes.map(l => l?.name)).toContain(group.label);
              internal = group.label;
            }

            expect(group.details).not.toBeUndefined();
            group.details!.forEach(detail => {
              expect(detail.positionType?.name).toBe(internal);
            });
          });
        }
      )
    );
  });

  it("groups by school", () => {
    const {
      grouper,
      labeller,
      sorter,
      mandatoryGroups,
    } = groupDictionary.school;
    fc.assert(
      fc.property(
        presetSchools.chain(locations =>
          fc
            // We're making an array of...
            .array(
              //...arbitraryDetails, with their locations selected from the above,...
              arbitraryDetail({ location: fc.constantFrom(...locations) }),
              //...2 to 20 details long.
              2,
              20
            )
            // We're also passing along the locations we generated, for reference.
            .map(details => ({
              locations,
              details,
            }))
        ),
        ({ locations, details }) => {
          const groups = labelledGroupBy(
            details,
            grouper,
            labeller,
            sorter,
            mandatoryGroups
          );

          groups.forEach((group, ind) => {
            // Make sure nothing's gone wrong with the arbitrary.
            let internal: string | undefined = undefined;
            if (group.label == "Undefined School") {
              expect(locations.map(l => typeof l)).toContain("undefined");
            } else {
              expect(locations.map(l => l?.name)).toContain(group.label);
              internal = group.label;
            }

            expect(group.details).not.toBeUndefined();
            group.details!.forEach(detail => {
              expect(detail.location?.name).toBe(internal);
            });
          });
        }
      )
    );
  });
});

describe(subGroupBy, () => {
  const detailsWithPresets = fc
    .tuple(presetPositionTypes, presetSchools)
    .chain(([positionTypes, schools]) => {
      return fc.array(
        arbitraryDetail({
          positionType: fc.constantFrom(...positionTypes),
          location: fc.constantFrom(...schools),
        }),
        2,
        20
      );
    });

  it("returns an empty list when passed no groupFns", () => {
    fc.assert(
      fc.property(fc.array(arbitraryDetail(), 1, 5), details => {
        expect(subGroupBy(details, [])).toHaveLength(0);
      })
    );
  });

  it("functions as labelledGroupBy when passed one groupFn", () => {
    fc.assert(
      fc.property(
        fc.tuple(fc.constantFrom(...groupOptions), detailsWithPresets),
        ([groupOption, details]) => {
          const {
            grouper,
            labeller,
            sorter,
            mandatoryGroups,
          } = groupDictionary[groupOption];
          expect(subGroupBy(details, [groupDictionary[groupOption]])).toEqual(
            labelledGroupBy(details, grouper, labeller, sorter, mandatoryGroups)
          );
        }
      )
    );
  });

  const removeSubGroups = ({ label, details }: DetailGroup) => ({
    label,
    details,
  });

  function recursiveTest(
    group: DetailGroup,
    groupFns: {
      grouper: (d: Detail) => unknown;
      labeller?: (key: string) => string;
      sorter?: (key1: string, key2: string) => number;
      mandatoryGroups?: string[];
    }[]
  ) {
    expect(group.details).not.toBeUndefined();

    if (groupFns.length == 0) {
      expect(group.subGroups).toBeUndefined();
      return;
    }

    const details = group.details!;
    const { grouper, labeller, sorter, mandatoryGroups } = groupFns[0];
    const simpleGroups = labelledGroupBy(
      details,
      grouper,
      labeller,
      sorter,
      mandatoryGroups
    );

    if (!group.details || group.details?.length == 0) return;
    expect(group.subGroups).not.toBeUndefined();
    const subGroups = group.subGroups!;
    expect(subGroups.map(removeSubGroups)).toEqual(
      simpleGroups.map(removeSubGroups)
    );
    subGroups.forEach(g => {
      recursiveTest(g, groupFns.slice(1));
    });
  }

  it("recursively functions as labelledGroupBy", () => {
    fc.assert(
      fc.property(
        fc.tuple(
          fc.set(fc.constantFrom(...groupOptions), 2, 3),
          detailsWithPresets
        ),
        ([groupOptions, details]) => {
          const groupFns = groupOptions.map(o => groupDictionary[o]);
          const { grouper, labeller, sorter, mandatoryGroups } = groupFns[0];

          const detailGroups = subGroupBy(details, groupFns);

          const simpleGroups = labelledGroupBy(
            details,
            grouper,
            labeller,
            sorter,
            mandatoryGroups
          );
          expect(detailGroups.map(removeSubGroups)).toEqual(
            simpleGroups.map(removeSubGroups)
          );
          detailGroups.forEach(group =>
            recursiveTest(group, groupFns.slice(1))
          );
        }
      )
    );
  });
});
