import { makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import * as React from "react";

type Props = {
  initials: string;
  className?: string;
};
export const ProfileAvatar: React.FC<Props> = props => {
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
