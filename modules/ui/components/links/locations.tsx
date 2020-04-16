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
  spanClass?: string;
};

export const LocationLink: React.FC<Props> = ({
  orgId,
  locationId,
  state,
  ...props
}) => {
  if (locationId === undefined) {
    return <span className={props.spanClass}> {props.children} </span>;
  }
  const urlStr = LocationViewRoute.generate({
    organizationId: orgId,
    locationId,
  });
  return (
    <BaseLink
      permissions={[PermissionEnum.LocationView]}
      to={{ ...pickUrl(urlStr), state: state }}
      {...props}
    />
  );
};
