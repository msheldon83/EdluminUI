import { useMutationBundle, useQueryBundle } from "graphql/hooks";
import { UpdateLoginEmail } from "ui/pages/profile/UpdateLoginEmail.gen";
import { UpdateUserTimezone } from "ui/pages/profile/UpdateUserTimezone.gen";
import { MyProfile } from "ui/pages/profile/MyProfile.gen";
import * as React from "react";
import { ProfileUI } from "./profile-ui";
import { useTimezones } from "reference-data/timezones";
import { UpdateLoginEmail } from "graphql/mutations/UpdateLoginEmail.gen";
import { ResetPassword } from "graphql/mutations/ResetPassword.gen";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(MyProfile);
  const timeZones = useTimezones();
  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail);
  const [resetPassword] = useMutationBundle(ResetPassword);
  const [updateTimezone] = useMutationBundle(UpdateUserTimezone);

  if (myProfile.state === "LOADING") {
    return <></>;
  }
  if (
    !myProfile.data ||
    !myProfile.data.userAccess ||
    !myProfile.data.userAccess.me ||
    !myProfile.data.userAccess.me.user ||
    !timeZones
  ) {
    return <div>oh no</div>;
  }
  return (
    <ProfileUI
      user={myProfile.data.userAccess.me.user}
      updateLoginEmail={updateLoginEmail}
      updateTimezone={updateTimezone}
      timeZoneOptions={timeZones}
      resetPassword={resetPassword}
    />
  );
};
