import * as React from "react";
import { dummyDistricts } from "./dummy-data";
import { SchoolGroup } from "./types";
import { EditGroup } from "./components/groups";

type Props = {
  orgId: string;
  orgUserId: string;
  search: string;
};

export const SubSchoolPreferencesEditUI: React.FC<Props> = ({
  orgId,
  orgUserId,
  search,
}) => {
  // Once backend is implemented, need to add a getSchoolPreferences.
  // Grab the preferences for the currently selected orgUser.
  // Skip if the currently selected value is "".
  const district = dummyDistricts[0];

  const filteredGroups =
    search == ""
      ? district.schoolGroups
      : district.schoolGroups.reduce((acc: SchoolGroup[], group) => {
          const filteredSchools = group.schools.filter(school =>
            school.name.includes(search)
          );
          if (filteredSchools.length) {
            acc.push({ ...group, schools: filteredSchools });
          }
          return acc;
        }, []);

  return (
    <>
      {filteredGroups.map(group => (
        <EditGroup
          key={group.id}
          group={group}
          onSet={() => () => {}}
          onSetAll={() => {}}
          onDelete={() => {}}
          onDeleteAll={() => {}}
        />
      ))}
    </>
  );
};
