import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { MyProfile } from "graphql/queries/MyProfile.gen";
import { ProfileUI } from "./profile-ui";
import { PageLoadingTrigger } from "ui/components/page-loading-indicator";

type Props = {};

export const ProfilePage: React.FC<Props> = props => {
  const myProfile = useQueryBundle(MyProfile);
  if (myProfile.state !== "DONE") {
    return <PageLoadingTrigger debugName="ProfilePage" />;
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
