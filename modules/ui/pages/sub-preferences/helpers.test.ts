import * as fc from "fast-check";
import { groupDistricts, joinGroupedDistricts } from "./helpers";
import { School, SchoolGroup, District } from "./types";

const natString = fc.nat().map(n => n.toString());

const withUniqueIds: <T>(
  generator: (id: string) => fc.Arbitrary<T>,
  // This prefix is to ensure that we don't accidentally have,
  // say, two schools with the same id.
  prefix: string,
  min?: number,
  max?: number
) => fc.Arbitrary<T[]> = (generator, prefix, min = 0, max = 10) =>
  // Generate a set of unique id strings...
  fc
    .set(natString, min, max)
    // then use those ids
    .chain(ids =>
      // genericTuple makes an array of arbitraries ((Arbitrary<T>)[])
      // into an arbitrary that makes arrays (Arbitrary<T[]>)
      // This lets us generate one output for each id.
      fc.genericTuple(
        // map generator onto the ids, prefixing them with, er, prefix.
        ids.map(id => generator(`${prefix}-${id}`))
      )
    );

const arbitrarySchool = (
  constantPreferences: ("favorite" | "hidden" | "default")[]
) => (id: string): fc.Arbitrary<School> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string(),
    // If constantPreference is defined, just use that, rather than picking randomly
    preference: fc.constantFrom(...constantPreferences),
  });

const arbitrarySchoolGroup = (
  constantPreferences: ("favorite" | "hidden" | "default")[]
) => (id: string): fc.Arbitrary<SchoolGroup> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string(),
    schools: withUniqueIds(arbitrarySchool(constantPreferences), id, 1, 10),
  });

const arbitraryDistrict = (
  constantPreferences: ("favorite" | "hidden" | "default")[]
) => (id: string): fc.Arbitrary<District> =>
  fc.record({
    id: fc.constant(id),
    name: fc.string(),
    orgUserId: fc.string(),
    schoolGroups: withUniqueIds(
      arbitrarySchoolGroup(constantPreferences),
      id,
      1,
      10
    ),
  });

const arbitraryGroupedDistricts: fc.Arbitrary<{
  favorites: District[];
  hidden: District[];
}> = fc.record({
  favorites: withUniqueIds(arbitraryDistrict(["favorite"]), ""),
  hidden: withUniqueIds(arbitraryDistrict(["hidden"]), ""),
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
  it("when provided only default schools, drops all of them", () => {
    fc.assert(
      fc.property(
        withUniqueIds(arbitraryDistrict(["default"]), ""),
        districts => {
          const grouped = groupDistricts(districts);
          // Here to keep eslint appeased
          expect(grouped.favorites.length).not.toEqual(0);
          expect(grouped.hidden.length).not.toEqual(0);
        }
      )
    );
  });
  it("when provided only favorite or hidden schools, partitions them (no elements dropped or added)", () => {
    fc.assert(
      fc.property(
        withUniqueIds(arbitraryDistrict(["favorite", "hidden"]), ""),
        districts => {
          const grouped = groupDistricts(districts);
          const rejoined = joinGroupedDistricts(grouped);
          // Here to keep eslint appeased
          expect(rejoined).not.toBeUndefined();
          checkDistricts(districts, rejoined);
        }
      )
    );
  });
  it("reconstructs grouped districts", () => {
    fc.assert(
      fc.property(arbitraryGroupedDistricts, grouped => {
        const joined = joinGroupedDistricts(grouped);
        const regrouped = groupDistricts(joined);
        // Here to keep eslint appeased
        expect(joined).not.toBeUndefined();
        checkDistricts(grouped.favorites, regrouped.favorites);
        checkDistricts(grouped.hidden, regrouped.hidden);
      })
    );
  });
});
