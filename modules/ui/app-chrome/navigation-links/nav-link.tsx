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
  orgId?: string;
};

export type SubNavItemType = {
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
    () => (!subNavActive && matches) || (!props.navBarExpanded && subNavActive),
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
      {expanded ? <ExpandLess /> : <ExpandMore />}
    </IconButton>
  );

  const subNavClasses = clsx({
    [classes.subNavItems]: true,
    [classes.subNavItemsOpen]: expanded,
  });

  const listItemClasses = clsx({
    [classes.menuItemWithSubNavItems]: showSubNavItems,
    [classes.listItemSubItemSelected]: expanded && subNavActive,
    [classes.active]: displayAsMatching,
  });

  return (
    <div>
      <Link to={props.route} className={classes.link}>
        <ListItem
          button
          className={`${classes.menuItem} ${props.className} ${listItemClasses} `}
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
          {subNavItems.map(s => {
            const { permissions, ...subNavProps } = s;
            return permissions ? (
              <Can do={permissions} key={subNavProps.route} orgId={props.orgId}>
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
    // There's some width issues with svgs and text, so this makes it look nicer
    paddingRight: `calc(${theme.spacing(1.5)}px + 1px)`,
    color: "inherit",
  },
  text: {
    fontWeight: 600,
    fontFamily: "Poppins",
    color: "inherit",
  },
  menuItem: {
    color: theme.customColors.lightSlate,
    whiteSpace: "nowrap",
    paddingLeft: theme.spacing(2),
    paddingBottom: theme.spacing(1.2),
    paddingTop: theme.spacing(1.2),

    "&:hover": {
      color: theme.palette.primary.main,
    },

    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.easeInOut,
      duration: theme.transitions.duration.standard,
    }),
  },
  menuItemWithSubNavItems: {},
  listItemSubItemSelected: {
    background: theme.customColors.white,
    color: theme.palette.primary.main,

    "&:hover": {
      background: theme.customColors.white,
      color: theme.palette.primary.main,
    },
  },
  active: {
    color: theme.palette.primary.main,
  },
  subNavItems: {
    background: "rgba(255,255,255,0.2)",
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
  subNavItemsOpen: {
    paddingBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
  },

  toggleSubNavItemsIcon: {
    color: "inherit",
    marginRight: theme.spacing(0.5),

    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
}));

const useMenuItemStyles = makeStyles(theme => ({
  gutters: {
    paddingRight: theme.typography.pxToRem(3),
  },
}));
