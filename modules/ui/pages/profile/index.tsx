import * as React from "react";
import { useQueryBundle, useMutationBundle } from "graphql/hooks";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { ProfileUI } from "./profile-ui";
import { UpdateLoginEmail } from "graphql/mutations/UpdateLoginEmail.gen";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(MyProfile);
  const [updateLoginEmail] = useMutationBundle(UpdateLoginEmail);

  if (myProfile.state !== "DONE") {
    return <div>loading</div>;
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
    />
  );
};
