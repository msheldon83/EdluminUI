import * as React from "react";
import { OrganizationSwitcherUI } from "./organizations-switcher-ui";
import { useBreakpoint } from "hooks";
import { MobileOrganizationSwitcherUI } from "./mobile-organizations-switcher-ui";

type Props = { contentClassName?: string };
export const OrganizationSwitcher: React.FC<Props> = props => {
  const isMobile = useBreakpoint("sm", "down");
  return (
    <>
      {isMobile ? (
        <MobileOrganizationSwitcherUI
          currentOrganizationName={"Berrien County ISD"}
        />
      ) : (
        <OrganizationSwitcherUI
          currentOrganizationName={"Berrien County ISD"}
          contentClassName={props.contentClassName}
        />
      )}
    </>
  );
};
