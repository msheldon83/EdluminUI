import {
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import { Link } from "react-router-dom";

type Props = {
  title: string | JSX.Element;
  icon: JSX.Element;
  route: string;
  className?: string;
};

export const NavLink: React.FC<Props> = props => {
  const classes = useStyles();
  return (
    <Link to={props.route} className={classes.link}>
      <ListItem
        button
        className={`${classes.menuItem} ${props.className}`}
        href={props.route}
      >
        <ListItemIcon className={classes.icon}>{props.icon}</ListItemIcon>
        <ListItemText
          primary={props.title}
          primaryTypographyProps={{
            className: classes.text,
            noWrap: true,
          }}
        />
      </ListItem>
    </Link>
  );
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
  menuItem: {
    color: theme.customColors.medLightGray,
    borderRadius: theme.typography.pxToRem(5),
    margin: `${theme.typography.pxToRem(5)} 0`,
    "&:hover": {
      backgroundColor: theme.customColors.edluminLightSlate,
      color: theme.customColors.white,
    },
  },
}));
