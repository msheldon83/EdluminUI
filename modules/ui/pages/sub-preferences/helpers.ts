import { Lens } from "@atomic-object/lenses";
import { OrgInfo, SchoolGroup, District, Grouped, Grouping } from "./types";
import { groupBy, has, partition } from "lodash-es";
import { PersonalPreference } from "graphql/server-types.gen";

export const makeDistricts = (
  orgInfo: OrgInfo[],
  locationGroups: {
    id: string;
    name: string;
    locations: {
      id: string;
      name: string;
    }[];
    orgId: string;
  }[],
  preferences: {
    locationId: string;
    preferenceId: PersonalPreference;
  }[]
): District[] => {
  const {
    favoritePreferences = [],
    hiddenPreferences = [],
  } = groupBy(preferences, p =>
    p.preferenceId === PersonalPreference.Favorite
      ? "favoritePreferences"
      : p.preferenceId === PersonalPreference.Hidden
      ? "hiddenPreferences"
      : "other"
  );
  const favoriteSchools = new Set(favoritePreferences.map(p => p.locationId));
  const hiddenSchools = new Set(hiddenPreferences.map(p => p.locationId));

  const groupedLocations = groupBy(locationGroups, group => group.orgId);
  return orgInfo.reduce((acc: District[], info) => {
    if (has(groupedLocations, info.orgId)) {
      acc.push({
        id: info.orgId,
        name: info.orgName,
        orgUserId: info.orgUserId,
        schoolGroups: groupedLocations[info.orgId].map(gL => ({
          ...gL,
          schools: gL.locations.map(l => ({
            ...l,
            preference: favoriteSchools.has(l.id)
              ? "favorite"
              : hiddenSchools.has(l.id)
              ? "hidden"
              : "default",
          })),
        })),
      });
    }
    return acc;
  }, []);
};

export function liftGrouping<Inner, Outer>(
  // Given a lens from the outer container to the inner elements...
  lens: Lens<Outer, Inner[]>,
  // and a way to group the inner elements...
  grouping: Grouping<Inner>
  // give a way to group the outer elements.
): Grouping<Outer> {
  return (outerElements: Outer[]) =>
    outerElements.reduce(
      (acc: Grouped<Outer>, o: Outer) => {
        const { favorites, hidden } = grouping(lens(o));
        if (favorites.length) {
          acc.favorites.push(lens.set(o, favorites));
        }
        if (hidden.length) {
          acc.hidden.push(lens.set(o, hidden));
        }
        return acc;
      },
      { favorites: [], hidden: [] }
    );
}

// For property-based testing
export function liftJoining<Inner, Outer>(
  lens: Lens<Outer, Inner[]>,
  equal: (out1: Outer, out2: Outer) => boolean,
  mergeInner: (inners1: Inner[], inners2: Inner[]) => Inner[]
): (outers1: Outer[], outers2: Outer[]) => Outer[] {
  return (outers1, outers2) => {
    const in1: Outer[] = [];
    const inBoth: [Outer, Outer][] = [];
    outers1.forEach(o1 => {
      const match = outers2.find(o2 => equal(o1, o2));
      if (match) {
        inBoth.push([o1, match]);
      } else {
        in1.push(o1);
      }
    });
    const in2 = outers2.filter(o2 => !outers1.some(o1 => equal(o1, o2)));
    const mergedFromBoth = inBoth.map(([o1, o2]) =>
      lens.update(o1, i1 => mergeInner(i1, lens(o2)))
    );
    return in1.concat(in2).concat(mergedFromBoth);
  };
}

export const groupDistricts = (districts: District[]) => {
  return liftGrouping(
    District.schoolGroups,
    liftGrouping(SchoolGroup.schools, schools => {
      const { favorite = [], hidden = [] } = groupBy(
        schools,
        s => s.preference
      );
      return { favorites: favorite, hidden };
    })
  )(districts);
};

export const joinGroupedDistricts = (groupedDistricts: Grouped<District>) => {
  return liftJoining(
    District.schoolGroups,
    (d1, d2) => d1.id == d2.id,
    liftJoining(
      SchoolGroup.schools,
      (s1, s2) => s1.id == s2.id,
      (s1, s2) => s1.concat(s2)
    )
  )(groupedDistricts.favorites, groupedDistricts.hidden);
};
