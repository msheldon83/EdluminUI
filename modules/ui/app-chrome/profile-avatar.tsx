import { makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import * as React from "react";
import { useQueryBundle } from "graphql/hooks";
import { LoadingStateTrigger } from "ui/components/loading-state/loading-state-trigger";
import { ProfileAvatar as ProfileAvatarQuery } from "graphql/queries/ProfileAvatar.gen";

type Props = {
  className?: string;
};

export const ProfileAvatar: React.FC<Props> = props => {
  const profile = useQueryBundle(ProfileAvatarQuery);

  if (profile.state === "LOADING") {
    return <LoadingStateTrigger fullScreen />;
  }
  if (
    !profile.data ||
    !profile.data.userAccess ||
    !profile.data.userAccess.me ||
    !profile.data.userAccess.me.user
  ) {
    return <ProfileAvatarUI initials={""} {...props} />;
  }

  const { firstName, lastName } = profile.data.userAccess.me.user;
  const initials = `${firstName ? firstName.substr(0, 1) : ""}${
    lastName ? lastName.substr(0, 1) : ""
  }`;

  return <ProfileAvatarUI initials={initials} {...props} />;
};

export const ProfileAvatarUI: React.FC<{
  initials: string;
  className?: string;
}> = props => {
  const classes = useStyles();

  return (
    <Avatar className={`${classes.avatar} ${props.className}`}>
      {props.initials}
    </Avatar>
  );
};

const useStyles = makeStyles(theme => ({
  avatar: {
    color: theme.customColors.edluminLightSlate,
  },
}));
