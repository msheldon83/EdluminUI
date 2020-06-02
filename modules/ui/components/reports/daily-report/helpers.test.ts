import * as fc from "fast-check";
import { Detail, labelledGroupBy, subGroupBy } from "./helpers";

const natString = fc.nat().map(n => n.toString());
const optional: <T>(
  arb: fc.Arbitrary<T>
) => fc.Arbitrary<T | undefined> = arb =>
  fc.option(arb).map(a => a ?? undefined);

type DetailSkeleton = {
  [key in keyof Detail]: fc.Arbitrary<Detail[key]>;
};

const arbitraryDetailFields: DetailSkeleton = {
  id: fc.string(),
  detailId: natString,
  orgId: natString,
  state: fc.constantFrom("unfilled", "filled", "noSubRequired", "closed"),
  type: fc.constantFrom("absence", "vacancy"),
  absenceRowVersion: optional(natString),
  vacancyRowVersion: optional(natString),
  vacancyId: optional(natString),
  employee: optional(
    fc.record({
      id: natString,
      name: fc.string(),
      lastName: fc.string(),
    })
  ),
  absenceReason: optional(fc.string()),
  vacancyReason: optional(fc.string()),
  date: fc.date(),
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
      name: fc.string(),
    })
  ),
  location: optional(
    fc.record({
      id: optional(natString),
      name: fc.string(),
    })
  ),
};

const arbitraryDetail: (
  overides?: Partial<DetailSkeleton>
) => fc.Arbitrary<Detail> = overides =>
  fc.record({ ...arbitraryDetailFields, ...overides });

describe(labelledGroupBy, () => {
  it("groups by state", () => {
    fc.assert(
      fc.property(
        fc.set(arbitraryDetailFields.state, 1, 4)
          .chain(states =>
                 fc.array(arbitraryDetail({state: fc.constantFrom(...states)}), 2, 20)),
        details => {
          const 
          Object.keys()
        }
      );
    );
  });
});
