import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { CanDo } from "ui/components/auth/types";

type Props = {
  permissions: CanDo;
  to: {
    pathname: string;
    hash: string;
    search: string;
    state?: any;
  };
  linkClass?: string;
  textClass?: string;
  displayText?: boolean;
};

// new URL() passes all props as defined, but that causes issues with Link
// We wrap it to replace undefineds with empty strings.
export const pickUrl = (s: string) => {
  const url = new URL(`http://dummy${s}`);
  return {
    pathname: url.pathname ?? "",
    search: url.search ?? "",
    hash: url.hash ?? "",
  };
};

export const BaseLink: React.FC<Props> = ({
  permissions,
  to,
  children,
  linkClass = "",
  textClass = "",
  displayText = true,
}) => {
  const classes = useStyles();
  return (
    <>
      <Can do={permissions}>
        <Link
          className={clsx(classes.root, classes.underlineHover, linkClass)}
          to={to}
        >
          {children}
        </Link>
      </Can>
      {displayText && (
        <Can not do={permissions}>
          <span className={textClass}>{children}</span>
        </Can>
      )}
    </>
  );
};

// Classes are yoinked from M-UI's Link
const useStyles = makeStyles(theme => ({
  /* Styles applied to the root element. */
  root: {
    color: theme.customColors.blue,
  },
  /* Styles applied to the root element if `underline="none"`. */
  underlineNone: {
    textDecoration: "none",
  },
  /* Styles applied to the root element if `underline="hover"`. */
  underlineHover: {
    textDecoration: "none",
    "&:hover": {
      textDecoration: "underline",
    },
  },
  /* Styles applied to the root element if `underline="always"`. */
  underlineAlways: {
    textDecoration: "underline",
  },
  // Same reset as ButtonBase.root
  /* Styles applied to the root element if `component="button"`. */
  button: {
    position: "relative",
    WebkitTapHighlightColor: "transparent",
    backgroundColor: "transparent", // Reset default value
    // We disable the focus ring for mouse, touch and keyboard users.
    outline: 0,
    border: 0,
    margin: 0, // Remove the margin in Safari
    borderRadius: 0,
    padding: 0, // Remove the padding in Firefox
    cursor: "pointer",
    userSelect: "none",
    verticalAlign: "middle",
    "-moz-appearance": "none", // Reset
    "-webkit-appearance": "none", // Reset
    "&::-moz-focus-inner": {
      borderStyle: "none", // Remove Firefox dotted outline.
    },
    "&$focusVisible": {
      outline: "auto",
    },
  },
  /* Pseudo-class applied to the root element if the link is keyboard focused. */
  focusVisible: {},
}));
