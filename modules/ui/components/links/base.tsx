import * as React from "react";
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
  spanClass?: string;
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

export const BaseLink: React.FC<Props> = ({ permissions, to, children, linkClass, spanClass}) => {
  // These are the styles applied to the base mui link
  const muiClass = "MuiTypography-root MuiLink-root MuiLink-underlineHover MuiTypography-colorPrimary"
  const className = `${muiClass}${linkClass ? " "+linkClass: ""}`
  return (
  <>
    <Can do={permissions}>
      <Link className={className} to={to}>
        {children}
      </Link>
    </Can>
    <Can not do={permissions}>
      <span className={spanClass}>
        {children}
      </span>
    </Can>
  </>
  )
}
