import { OrgInfo, SchoolGroup, District } from "./types";
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

export const groupDistricts = (
  districts: District[]
): { favorites: District[]; hidden: District[] } => {
  const { favoriteDistricts, hiddenDistricts } = districts.reduce(
    (
      {
        favoriteDistricts,
        hiddenDistricts,
      }: { favoriteDistricts: District[]; hiddenDistricts: District[] },
      district
    ) => {
      const { favoriteGroups, hiddenGroups } = district.schoolGroups.reduce(
        (
          {
            favoriteGroups,
            hiddenGroups,
          }: { favoriteGroups: SchoolGroup[]; hiddenGroups: SchoolGroup[] },
          group
        ) => {
          const { favorite, hidden } = groupBy(
            group.schools,
            s => s.preference
          );
          if (favorite && favorite.length) {
            favoriteGroups.push({ ...group, schools: favorite });
          }
          if (hidden && hidden.length) {
            hiddenGroups.push({ ...group, schools: hidden });
          }
          return { favoriteGroups, hiddenGroups };
        },
        { favoriteGroups: [], hiddenGroups: [] }
      );
      if (favoriteGroups.length) {
        favoriteDistricts.push({ ...district, schoolGroups: favoriteGroups });
      }
      if (hiddenGroups.length) {
        hiddenDistricts.push({ ...district, schoolGroups: hiddenGroups });
      }
      return { favoriteDistricts, hiddenDistricts };
    },
    { favoriteDistricts: [], hiddenDistricts: [] }
  );
  return { favorites: favoriteDistricts, hidden: hiddenDistricts };
};

// For property-based testing
export const joinGroupedDistricts = ({
  favorites,
  hidden,
}: {
  favorites: District[];
  hidden: District[];
}) => {
  const inFavs: District[] = [];
  const inBoth: [District, District][] = [];
  favorites.forEach(fav => {
    const match = hidden.find(hid => fav.id == hid.id);
    if (match) {
      inBoth.push([fav, match]);
    } else {
      inFavs.push(fav);
    }
  });
  const inHidden = hidden.filter(
    hid => !favorites.some(fav => fav.id == hid.id)
  );
  const mergedFromBoth = inBoth.map(([fav, hid]) => {
    const favoriteGroups = fav.schoolGroups;
    const hiddenGroups = hid.schoolGroups;

    const inFavGroups: SchoolGroup[] = [];
    const inBothGroups: [SchoolGroup, SchoolGroup][] = [];
    favoriteGroups.forEach(fav => {
      const match = hiddenGroups.find(hid => fav.id == hid.id);
      if (match) {
        inBothGroups.push([fav, match]);
      } else {
        inFavGroups.push(fav);
      }
    });
    const inHiddenGroups = hiddenGroups.filter(
      hid => !favoriteGroups.some(fav => fav.id == hid.id)
    );
    const mergedFromBothGroups = inBothGroups.map(([f, h]) => ({
      ...f,
      schools: f.schools.concat(h.schools),
    }));
    return {
      ...fav,
      schoolGroups: inFavGroups
        .concat(inHiddenGroups)
        .concat(mergedFromBothGroups),
    };
  });
  return inFavs.concat(inHidden).concat(mergedFromBoth);
};
