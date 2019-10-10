import { makeStyles } from "@material-ui/core";
import Avatar from "@material-ui/core/Avatar";
import * as React from "react";

type Props = {
  initials: string;
};
export const ProfileAvatar: React.FC<Props> = props => {
  const classes = useStyles();
  return <Avatar className={classes.avatar}>{props.initials}</Avatar>;
};

const useStyles = makeStyles(theme => ({
  avatar: {
    color: theme.customColors.edluminLightSlate,
    height: theme.typography.pxToRem(60),
    width: theme.typography.pxToRem(60),
  },
}));
