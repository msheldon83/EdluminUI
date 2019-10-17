import {
  ListItemIcon,
  ListItemText,
  makeStyles,
  MenuItem,
} from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string | JSX.Element;
  icon: JSX.Element;
  route?: string;
  onClick?: () => void;
  className?: string;
};

export const MenuLink: React.FC<Props> = props => {
  const classes = useStyles();

  const menuItem = (
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
  if (props.route) {
    return (
      <Link to={props.route} className={classes.link}>
        {menuItem}
      </Link>
    );
  }
  return menuItem;
};

const useStyles = makeStyles(theme => ({
  link: { textDecoration: "none" },
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
