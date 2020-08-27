import * as React from "react";
import PublicIcon from "@material-ui/icons/Public";
import BusinessIcon from "@material-ui/icons/Business";

export const ApplicationLogo: React.FC<{
  logo?: string | null;
  isPrivate: boolean;
}> = ({ logo, isPrivate }) => {
  return logo ? (
    <img src={logo} />
  ) : isPrivate ? (
    <BusinessIcon />
  ) : (
    <PublicIcon />
  );
};
