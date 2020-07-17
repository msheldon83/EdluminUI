import * as fc from "fast-check";
import { groupDistricts, joinGroupedDistricts } from "./helpers";
import { School, SchoolGroup, District, Grouped } from "./types";

const natString = fc.nat().map(n => n.toString());

const liftArbitraries = fc.tuple as <T>(
  ...arbs: fc.Arbitrary<T>[]
) => fc.Arbitrary<T[]>;

const withUniqueIds: <T>(
  generator: (id: string) => fc.Arbitrary<T>,
  min?: number,
  max?: number
) => fc.Arbitrary<T[]> = (generator, min = 0, max = 10) =>
  fc
    .set(natString, min, max)
    .chain(ids => liftArbitraries(...ids.map(generator)));

const arbitrarySchool = (constantPreference?: "favorite" | "hidden") => (
  id: string
): fc.Arbitrary<School> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string(),
    // If constantPreference is defined, just use that, rather than picking randomly
    preference: constantPreference
      ? fc.constant(constantPreference)
      : // Not "default", since those would be dropped from upcoming tests
        // Easier to test some invariants when all schools are one or the other
        fc.constantFrom("favorite", "hidden"),
  });

const arbitrarySchoolGroup = (constantPreference?: "favorite" | "hidden") => (
  id: string
): fc.Arbitrary<SchoolGroup> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string(),
    schools: withUniqueIds(arbitrarySchool(constantPreference), 1, 10),
  });

const arbitraryDistrict = (constantPreference?: "favorite" | "hidden") => (
  id: string
): fc.Arbitrary<District> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string(),
    orgUserId: fc.string(),
    schoolGroups: withUniqueIds(
      arbitrarySchoolGroup(constantPreference),
      1,
      10
    ),
  });

const arbitraryGroupedDistricts: fc.Arbitrary<Grouped<District>> = fc.record({
  favorites: withUniqueIds(arbitraryDistrict("favorite")),
  hidden: withUniqueIds(arbitraryDistrict("hidden")),
});

// General fn to check if two layers are equal up to reordering,
function checkLayers<T extends { id: unknown }>(
  l1: T[],
  l2: T[],
  nextStep?: (l1: T, l2: T | undefined) => void
): void {
  expect(l1.length).toEqual(l2.length);
  expect(new Set(l1.map(l => l.id))).toEqual(new Set(l2.map(l => l.id)));
  if (nextStep) {
    const pairs: [T, T | undefined][] = l1.map(t1 => [
      t1,
      l2.find(t2 => t1.id == t2.id),
    ]);
    pairs.forEach(([t1, t2]) => nextStep(t1, t2));
  }
}

const checkDistricts = (districts1: District[], districts2: District[]) =>
  checkLayers(districts1, districts2, (d1, d2) => {
    expect(d2).not.toBeUndefined();
    checkLayers(d1.schoolGroups, d2!.schoolGroups, (g1, g2) => {
      expect(g2).not.toBeUndefined();
      checkLayers(g1.schools, g2!.schools);
    });
  });

describe("groupDistricts", () => {
  it("when provided only favorite or hidden schools, partitions them (no elements dropped or added)", () => {
    fc.assert(
      fc.property(withUniqueIds(arbitraryDistrict(), 1, 10), districts => {
        const grouped = groupDistricts(districts);
        const rejoined = joinGroupedDistricts(grouped);
        checkDistricts(districts, rejoined);
      })
    );
  });
  it("reconstructs grouped districts", () => {
    fc.assert(
      fc.property(arbitraryGroupedDistricts, grouped => {
        const joined = joinGroupedDistricts(grouped);
        const regrouped = groupDistricts(joined);
        checkDistricts(grouped.favorites, regrouped.favorites);
        checkDistricts(grouped.hidden, regrouped.hidden);
      })
    );
  });
});
