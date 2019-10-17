import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { UpdateLoginEmail } from "ui/pages/profile/UpdateLoginEmail.gen";
import { UpdateUserTimezone } from "ui/pages/profile/UpdateUserTimezone.gen";
import { MyProfile } from "ui/pages/profile/MyProfile.gen";
import * as React from "react";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";
import { ProfileUI } from "./profile-ui";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(MyProfile);
  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail);
  const [updateTimezone] = useMutationBundle(UpdateUserTimezone);

  if (myProfile.state === "LOADING") {
    return <LoadingStateTrigger fullScreen />;
  }
  if (
    !myProfile.data ||
    !myProfile.data.userAccess ||
    !myProfile.data.userAccess.me ||
    !myProfile.data.userAccess.me.user
  ) {
    return <div>oh no</div>;
  }
  return (
    <ProfileUI
      user={myProfile.data.userAccess.me.user}
      updateLoginEmail={updateLoginEmail}
      updateTimezone={updateTimezone}
    />
  );
};
