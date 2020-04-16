import * as React from "react";
import { BaseLink, pickUrl } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { LocationViewRoute } from "ui/routes/locations";

type Props = {
  orgId: string;
  locationId: string | undefined;
  state?: any;
  linkClass?: string;
  canWrapper?: (children: React.ReactNode) => React.ReactNode;
  cannotWrapper?: (children: React.ReactNode) => React.ReactNode;
};

export const LocationLink: React.FC<Props> = ({
  orgId,
  locationId,
  state,
  ...props
}) => {
  console.log(props.linkClass)
  if (locationId === undefined) {
    return <> children </>;
  }
  const urlStr = LocationViewRoute.generate({
    organizationId: orgId,
    locationId: locationId,
  });
  return (
    <BaseLink
      permissions={[PermissionEnum.LocationView]}
      to={{ ...pickUrl(urlStr), state: state }}
      {...props}
    />
  );
};
