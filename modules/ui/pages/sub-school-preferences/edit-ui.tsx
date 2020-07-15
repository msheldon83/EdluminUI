import * as React from "react";
import { dummyDistricts } from "./dummy-data";
import { EditGroup } from "./components/groups";

type Props = {
  orgId: string;
  orgUserId: string;
};

export const SubSchoolPreferencesEditUI: React.FC<Props> = ({
  orgId,
  orgUserId,
}) => {
  // Once backend is implemented, need to add a getSchoolPreferences.
  // Grab the preferences for the currently selected orgUser.
  // Skip if the currently selected value is "".
  const district = dummyDistricts[0];

  return (
    <>
      {district.schoolGroups.map(group => (
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
