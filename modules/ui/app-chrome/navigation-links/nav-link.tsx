import {
  Collapse,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  makeStyles,
} from "@material-ui/core";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import clsx from "clsx";
import { isEqual } from "lodash-es";
import * as React from "react";
import { useCallback, useMemo, useState } from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { SubNavLink } from "./sub-nav-link";
import { PermissionEnum } from "graphql/server-types.gen";
import { Can } from "ui/components/auth/can";

type Props = SubNavItemType & {
  icon: JSX.Element;
  subNavItems?: Array<SubNavItemType>;
  navBarExpanded: boolean;
};

type SubNavItemType = {
  title: string | JSX.Element;
  route: string;
  onClick?: () => void;
  className?: string;
  exact?: boolean;
  permissions?: PermissionEnum[];
};

export const NavLink: React.FC<Props> = props => {
  const classes = useStyles();
  const menuItemClasses = useMenuItemStyles();
  const matches =
    useRouteMatch({ exact: props.exact ?? false, path: props.route }) !==
      null && props.route;

  const [subNavMatches, setSubNavMatches] = useState<Set<string>>(new Set([]));

  const setSubNavMatchesCallback = useCallback(
    (route: string, matches: string | false) => {
      const updated = new Set(subNavMatches);
      if (!matches) {
        updated.delete(route);
      } else {
        updated.add(route);
      }
      if (!isEqual(updated, subNavMatches)) setSubNavMatches(updated);
    },
    [subNavMatches, setSubNavMatches]
  );

  const subNavActive = useMemo(() => {
    return subNavMatches && subNavMatches.size > 0;
  }, [subNavMatches]);

  const [subNavOpen, setSubNavOpen] = useState(false);
  const expanded = subNavActive || subNavOpen;
  const { subNavItems = [] } = props;
  const showSubNavItems =
    subNavItems && subNavItems.length > 0 && props.navBarExpanded;

  // When the nav bar is collapsed, bubble up selected state to top level item
  const displayAsMatching = useMemo(
    () => matches || (!props.navBarExpanded && subNavActive),
    [props.navBarExpanded, subNavActive, matches]
  );

  const toggleSubNavClick = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();

    !subNavActive && setSubNavOpen(!subNavOpen);
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
          className={`${classes.menuItem} ${
            props.className
          } ${displayAsMatching && classes.active} ${showSubNavItems &&
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
          {showSubNavItems && renderSubNavIcon()}
        </ListItem>
      </Link>

      {showSubNavItems && (
        <Collapse
          in={expanded}
          timeout="auto"
          component="ul"
          className={subNavClasses}
        >
          {subNavItems.map(subNavProps => {
            return subNavProps?.permissions ? (
              <Can do={subNavProps?.permissions} key={subNavProps.route}>
                <SubNavLink
                  {...subNavProps}
                  setSubNavMatches={setSubNavMatchesCallback}
                />
              </Can>
            ) : (
              <SubNavLink
                {...subNavProps}
                key={subNavProps.route}
                setSubNavMatches={setSubNavMatchesCallback}
              />
            );
          })}
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
    whiteSpace: "nowrap",
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
    color: theme.customColors.medLightGray,

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
