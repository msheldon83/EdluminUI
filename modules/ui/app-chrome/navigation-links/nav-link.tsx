import {
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import * as React from "react";
import { Link, useRouteMatch } from "react-router-dom";

type Props = {
  title: string | JSX.Element;
  icon: JSX.Element;
  route: string;
  onClick?: () => void;
  className?: string;
  exact?: boolean;
};

export const NavLink: React.FC<Props> = props => {
  const classes = useStyles();
  const matches =
    useRouteMatch({ exact: props.exact ?? false, path: props.route }) !==
      null && props.route;
  return (
    <Link to={props.route} className={classes.link}>
      <ListItem
        button
        className={`${classes.menuItem} ${props.className} ${matches &&
          classes.active}`}
        href={props.route}
        onClick={props.onClick}
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
    transition: theme.transitions.create("background", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  },
  active: {
    backgroundColor: theme.customColors.edluminLightSlate,
  },
}));
