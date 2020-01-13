import * as React from "react";
import { useIsMobile } from "hooks";

export const DesktopOnly: React.FC = props => {
  const isMobile = useIsMobile();
  if (!isMobile) {
    return props.children;
  }
  return <></>;
};

export const MobileOnly: React.FC = props => {
  const isMobile = useIsMobile();
  if (isMobile) {
    return props.children;
  }
  return <></>;
};
