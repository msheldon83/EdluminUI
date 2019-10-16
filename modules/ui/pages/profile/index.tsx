import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { ProfileUI } from "./profile-ui";
import { UpdateLoginEmail } from "graphql/mutations/UpdateLoginEmail.gen";
import { ResetPassword } from "graphql/mutations/ResetPassword.gen";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(MyProfile);
  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail);
  const [resetPassword] = useMutationBundle(ResetPassword);

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
      resetPassword={resetPassword}
    />
  );
};
