import { useQueryBundle } from "graphql/hooks";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import * as React from "react";
import { LoadingStateTrigger } from "ui/components/page-loading-indicator/loading-state-trigger";
import { ProfileUI } from "./profile-ui";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(MyProfile);
  if (myProfile.state === "LOADING") {
    return <LoadingStateTrigger debugMsg="ProfilePage" />;
  }
  if (
    !myProfile.data ||
    !myProfile.data.userAccess ||
    !myProfile.data.userAccess.me ||
    !myProfile.data.userAccess.me.user
  ) {
    return <div>oh no</div>;
  }
  return <ProfileUI user={myProfile.data.userAccess.me.user} />;
};
