import * as React from "react";
import { Link } from "react-router-dom";
import { Can } from "ui/components/auth/can";
import { CanDo } from "ui/components/auth/types";
import { Route } from "ui/routes/definition";
import { PermissionEnum } from "graphql/server-types.gen";
import { PersonViewRoute } from "ui/routes/people";
import { LocationViewRoute } from "ui/routes/locations";

function urlFromRoute<ID extends string>(
  organizationId: string,
  idName: ID,
  route: Route<"organizationId" | ID>,
  idValue: string
) {
  const params: Partial<Record<"organizationId" | ID, string>> = {
    organizationId: organizationId,
  };
  params[idName] = idValue;
  return route.generate(params as Record<"organizationId" | ID, string>);
}

const splitURL = (url: string, query?: string) => {
  const maybeIndex = (str: string, sub: string, index?: number) => {
    const search = str.indexOf(sub, index);
    return search === -1 ? null : search;
  };
  const search = maybeIndex(url, "?");
  const hash = maybeIndex(url, "#", search ?? 0);
  return {
    pathname: url.substring(0, search ?? hash ?? undefined),
    search: `${
      search ? url.substring(search, hash ?? undefined) : undefined
    }${query}`,
    hash: hash ? url.substring(hash) : undefined,
  };
};

type LinkProps<ID extends string> = Record<ID, string | undefined> & {
  orgId: string;
  search?: any;
  state?: any;
};

function PermissionLink<ID extends string>(
  idName: ID,
  permissions: CanDo,
  route: Route<"organizationId" | ID>
): React.FC<LinkProps<ID>> {
  return props => {
    if (props[idName] === undefined) {
      return (<> {props.children} </>)
    }
    const url = urlFromRoute(props.orgId, idName, route, props[idName]!);
    const to = props.state ? { ...splitURL(url), state: props.state } : url;
    return (
      <>
        <Can do={permissions}>
          <Link to={to}>{props.children}</Link>
        </Can>
        <Can not do={permissions}>
          {props.children}
        </Can>
      </>
    );
  };
}

export const EmployeeLink = PermissionLink(
  "orgUserId",
  [PermissionEnum.EmployeeView],
  PersonViewRoute
);

export const SubstituteLink = PermissionLink(
  "orgUserId",
  [PermissionEnum.SubstituteView],
  PersonViewRoute
)

export const LocationLink = PermissionLink(
  "locationId",
  [PermissionEnum.LocationView],
  LocationViewRoute
)
