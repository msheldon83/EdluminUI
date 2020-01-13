import * as React from "react";
import { useIsMobile } from "hooks";

export const DesktopOnly: React.FC = props => {
  const isMobile = useIsMobile();
  return <>{!isMobile && props.children}</>;
};

export const MobileOnly: React.FC = props => {
  const isMobile = useIsMobile();
  return <>{isMobile && props.children}</>;
};
