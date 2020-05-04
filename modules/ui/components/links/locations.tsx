import * as React from "react";
import { BaseLink, LinkOptions, pickUrl } from "./base";
import { CanDo } from "ui/components/auth/types";
import { PermissionEnum } from "graphql/server-types.gen";
import { LocationViewRoute } from "ui/routes/locations";
import { useOrganizationId } from "core/org-context";

type Props = {
  orgId?: string;
  locationId: string | undefined;
  state?: any;
} & LinkOptions;

export const LocationLink: React.FC<Props> = ({
  orgId,
  locationId,
  state,
  ...props
}) => {
  const contextOrgId = useOrganizationId();

  if (!locationId || !contextOrgId) {
    return <span className={props.textClass}> {props.children} </span>;
  }
  const urlStr = LocationViewRoute.generate({
    organizationId: orgId ?? contextOrgId,
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
