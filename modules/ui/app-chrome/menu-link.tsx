import {
  ListItemIcon,
  ListItemText,
  makeStyles,
  MenuItem,
} from "@material-ui/core";
import * as React from "react";

type Props = {
  title: string | JSX.Element;
  icon: JSX.Element;
  onClick: () => void;
  className?: string;
};

export const MenuLink: React.FC<Props> = props => {
  const classes = useStyles();

  return (
    <MenuItem button className={props.className} onClick={props.onClick}>
      <ListItemIcon className={classes.icon}>{props.icon}</ListItemIcon>
      <ListItemText
        primary={props.title}
        primaryTypographyProps={{
          className: classes.text,
          noWrap: true,
        }}
      />
    </MenuItem>
  );
};

const useStyles = makeStyles(theme => ({
  icon: {
    minWidth: 0,
    paddingRight: theme.typography.pxToRem(24),
    color: "inherit",
  },
  text: {
    fontWeight: 600,
    fontFamily: "Poppins",
    color: "inherit",
  },
}));
