import { Lens } from "@atomic-object/lenses";
import { OrgInfo, SchoolGroup, District, Grouped, Grouping } from "./types";
import { groupBy, has } from "lodash-es";
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

function liftGrouping<Inner, Outer>(
  lens: Lens<Outer, Inner[]>,
  grouping: Grouping<Inner>
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
