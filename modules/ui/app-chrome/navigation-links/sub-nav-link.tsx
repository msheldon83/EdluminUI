import { makeStyles } from "@material-ui/core";
import * as React from "react";
import { Link, useRouteMatch } from "react-router-dom";
import { useEffect } from "react";

type Props = {
  title: string | JSX.Element;
  route: string;
  setSubNavActive: (active: boolean) => void;
  onClick?: () => void;
  className?: string;
  exact?: boolean;
};

export const SubNavLink: React.FC<Props> = props => {
  const { title, route, setSubNavActive, ...linkProps } = props;
  const matches = useRouteMatch({ exact: true, path: route }) !== null && route;
  const classes = useStyles();

  useEffect(() => {
    if (matches) setSubNavActive(true);
    // setSubNavActive(matches);
  }, [matches, setSubNavActive]);

  return (
    <li>
      <Link
        {...linkProps}
        to={route}
        className={`${classes.subNavItemLink} ${matches && classes.active}`}
      >
        {title}
      </Link>
    </li>
  );
};

const useStyles = makeStyles(theme => ({
  active: {
    backgroundColor: theme.customColors.edluminLightSlate,
  },

  subNavItemLink: {
    color: "#9da2ab", // this color isn't used anywhere else
    display: "block",
    fontSize: theme.typography.pxToRem(14),
    lineHeight: theme.typography.pxToRem(30),
    fontWeight: 600,
    paddingLeft: theme.spacing(8),
    textDecoration: "none",
    transition: theme.transitions.create("color", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.shorter,
    }),
    borderRadius: theme.typography.pxToRem(4),
    // This should have selected styles

    "&:hover": {
      color: theme.customColors.white,
    },
  },
}));
