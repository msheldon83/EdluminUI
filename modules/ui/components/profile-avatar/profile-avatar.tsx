import { makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import { useQueryBundle } from "graphql/hooks";
import * as React from "react";
import { UserProfileAvatar } from "ui/components/profile-avatar/UserProfileAvatar.gen";
import { getInitials } from "../helpers";

type Props = {
  className?: string;
};

export const ProfileAvatar: React.FC<Props> = props => {
  const profile = useQueryBundle(UserProfileAvatar);

  if (profile.state === "LOADING") {
    return <></>;
  }
  if (
    !profile.data ||
    !profile.data.userAccess ||
    !profile.data.userAccess.me ||
    !profile.data.userAccess.me.user
  ) {
    return <ProfileAvatarUI initials={""} {...props} />;
  }

  const initials = getInitials(profile.data.userAccess.me.user);

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
