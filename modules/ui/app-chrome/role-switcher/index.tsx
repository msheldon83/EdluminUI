import * as React from "react";
import { RoleSwitcherUI } from "./role-switcher-ui";
import { useQueryBundle } from "../../../graphql/hooks";

type Props = {};

// //GQL query
// export const ProfileAvatar: React.FC<Props> = props => {
//   const profile = useQueryBundle(ProfileAvatarQuery);

//   if (profile.state === "LOADING") {
//     return <></>;
//   }
//   if (
//     !profile.data ||
//     !profile.data.userAccess ||
//     !profile.data.userAccess.me ||
//     !profile.data.userAccess.me.user
//   ) {
//     return <ProfileAvatarUI initials={""} {...props} />;
//   }

//   const initials = getInitials(profile.data.userAccess.me.user);

//   return <ProfileAvatarUI initials={initials} {...props} />;
// };

export const RoleSwitcher: React.FC<Props> = props => {
  return (
    <RoleSwitcherUI
      selectedRole="Administrator"
      roleOptions={["Administrator", "Employee", "Replacement Employee"]}
    />
  );
};
