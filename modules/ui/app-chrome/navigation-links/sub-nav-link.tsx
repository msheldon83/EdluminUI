import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { useEffect } from "react";

type Props = {
  title: string | JSX.Element;
  route: string;
  setSubNavMatches: (route: string, matches: string | false) => void;
  onClick?: () => void;
  className?: string;
  exact?: boolean;
};

export const SubNavLink: React.FC<Props> = props => {
  const {
    title,
    route,
    setSubNavMatches: setSubNavActive,
    ...linkProps
  } = props;

  // exact is false to allow for the higlighted state on sub routes
  const matches =
    useRouteMatch({ exact: false, path: route }) !== null && route;
  const classes = useStyles();

  useEffect(() => {
    setSubNavActive(route, matches);
  }, [matches, setSubNavActive, route]);

  return (
    <li>
      <Link
        {...linkProps}
        to={route}
        className={`${classes.subNavItemLink} ${matches ? classes.active : ""}`}
      >
        {title}
      </Link>
    </li>
  );
};

const useStyles = makeStyles(theme => ({
  subNavItemLink: {
    color: theme.customColors.lightSlate,
    display: "block",
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(30),
    fontWeight: 600,
    paddingLeft: theme.spacing(6.6),
    textDecoration: "none",
    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter,
    }),

    "&:hover": {
      color: theme.palette.primary.main,
    },
  },
  active: {
    color: theme.palette.primary.main,
  },
}));
