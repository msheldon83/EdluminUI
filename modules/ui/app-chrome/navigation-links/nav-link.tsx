import {
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
  Collapse,
  IconButton,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import * as React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import clsx from "clsx";
import { some, compact } from "lodash-es";
import { useState } from "react";
import { SubNavLink } from "./sub-nav-link";

type Props = NavItemType & {
  icon: JSX.Element;
  subNavItems?: Array<NavItemType>;
};

type NavItemType = {
  title: string | JSX.Element;
  route: string;
  onClick?: () => void;
  className?: string;
  exact?: boolean;
};

export const NavLink: React.FC<Props> = props => {
  const classes = useStyles();
  const menuItemClasses = useMenuItemStyles();
  const matches =
    useRouteMatch({ exact: props.exact ?? false, path: props.route }) !==
      null && props.route;

  const [subNavActive, setSubNavActive] = useState();
  // const subNavActive =
  //   compact(
  //     props.subNavItems?.map(
  //       n => useRouteMatch({ path: n.route, exact: n.exact }) !== null
  //     )
  //   ).length === 1;

  const [subNavOpen, setSubNavOpen] = useState(false);
  const expanded = subNavActive || subNavOpen;
  const { subNavItems = [] } = props;
  const hasSubNavItems = subNavItems && subNavItems.length > 0;

  const toggleSubNavClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setSubNavOpen(!subNavOpen);
  };

  const renderSubNavIcon = () => (
    <IconButton
      size="small"
      className={classes.toggleSubNavItemsIcon}
      onClick={toggleSubNavClick}
      disableRipple
    >
      {expanded ? (
        <ExpandLess className={classes.expandLessIcon} />
      ) : (
        <ExpandMore />
      )}
    </IconButton>
  );

  const subNavClasses = clsx({
    [classes.subNavItems]: true,
    [classes.subNavItemsOpen]: expanded,
  });

  return (
    <div>
      <Link to={props.route} className={classes.link}>
        <ListItem
          button
          className={`${classes.menuItem} ${props.className} ${matches &&
            classes.active} ${hasSubNavItems &&
            classes.menuItemWithSubNavItems}`}
          href={props.route}
          onClick={props.onClick}
          classes={menuItemClasses}
        >
          <ListItemIcon className={classes.icon}>{props.icon}</ListItemIcon>
          <ListItemText
            primary={props.title}
            primaryTypographyProps={{
              className: classes.text,
            }}
          />
          {hasSubNavItems && renderSubNavIcon()}
        </ListItem>
      </Link>

      {hasSubNavItems && (
        <Collapse
          in={expanded}
          timeout="auto"
          component="ul"
          className={subNavClasses}
        >
          {subNavItems.map(subNavProps => (
            <SubNavLink
              key={subNavProps.route}
              {...subNavProps}
              setSubNavActive={setSubNavActive}
            />
          ))}
        </Collapse>
      )}
    </div>
  );
};

const useStyles = makeStyles(theme => ({
  container: {
    backgroundColor: theme.customColors.edluminSlate,
    borderRadius: theme.typography.pxToRem(5),
    margin: `${theme.typography.pxToRem(5)} 0 0`,
    transition: theme.transitions.create("background-color", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  },
  link: {
    textDecoration: "none",
  },
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
    "&:hover": {
      backgroundColor: theme.customColors.edluminLightSlate,
      color: theme.customColors.white,
    },
    transition: theme.transitions.create("background", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  },
  menuItemWithSubNavItems: {
    marginBottom: 0,
  },
  active: {
    backgroundColor: theme.customColors.edluminLightSlate,
  },
  subNavItems: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  subNavItemsOpen: {
    padding: `0 0 ${theme.typography.pxToRem(7)}`,
  },

  toggleSubNavItemsIcon: {
    color: "#9da2ab",

    "&:hover": {
      color: theme.customColors.white,
    },
  },
  expandLessIcon: {
    color: theme.customColors.white,
  },
}));

const useMenuItemStyles = makeStyles(theme => ({
  gutters: {
    paddingRight: theme.typography.pxToRem(3),
  },
}));
