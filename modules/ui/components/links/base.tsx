import * as React from "react";
import clsx from "clsx";
import { makeStyles } from "@material-ui/core";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { CanDo } from "ui/components/auth/types";

export type LinkOptions = {
  linkClass?: string;
  textClass?: string;
  color?: "blue" | "black";
  displayText?: boolean;
  disabled?: boolean;
  /*
  Target behaves as per <a> tag targets.
  "_self", the default, opens in the current browsing context
  "_blank" opens in a new tab usually, but can be a new window
           based on user configuration
  "_parent" opens in the parent of the current browsing context.
          (Not added atm, but could be if needed later)
  "_top" opens in the highest ancestor of the current browsing context.
          (Not added atm, but could be if needed later)
   */
  target?: "_self" | "_blank";
};

type Props = {
  permissions?: CanDo;
  to:
    | string
    | {
        pathname: string;
        hash?: string;
        search?: string;
        state?: any;
      };
} & LinkOptions;

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
  color = "blue",
  disabled,
  target = "_self",
}) => {
  const classes = useStyles();

  const text = <span className={textClass}>{children}</span>;
  if (disabled) return text;

  const link = (
    <Link
      className={clsx(
        classes.root,
        classes.underlineHover,
        linkClass,
        classes[color]
      )}
      to={to}
      target={target}
      rel={target == "_self" ? "" : "noreferrer noopener"}
    >
      {children}
    </Link>
  );
  if (!permissions) {
    return link;
  }

  return (
    <>
      <Can do={permissions}>{link}</Can>
      {displayText && (
        <Can not do={permissions}>
          {text}
        </Can>
      )}
    </>
  );
};

// Classes are yoinked from M-UI's Link
const useStyles = makeStyles(theme => ({
  /* Styles applied to the root element. */
  root: {},
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

  // Added to M-UI class; want to be able to change color
  blue: {
    color: theme.customColors.blue,
  },
  black: {
    color: theme.customColors.black,
  },
  grey: {
    color: theme.customColors.edluminSubText,
  },
}));
