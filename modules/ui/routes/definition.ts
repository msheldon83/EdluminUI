import { generatePath, useParams } from "react-router";

export type Route<Params extends string> = {
  readonly path: string;
  generate: (params: { [k in Params]: string }) => string;
};

export function defineRoute<Params extends string>(
  path: string,
  params: Params[]
): Route<Params> {
  return {
    path: normalizePath(path),
    generate: (params: { [k in Params]: string }) => generatePath(path, params),
  };
}

export function defineSubRoute<Params extends string>(
  parent: Route<Params>,
  subPath: string
): Route<Params>;

export function defineSubRoute<
  ParentParams extends string,
  OwnParams extends string
>(
  parent: Route<ParentParams>,
  subPath: string,
  params: OwnParams[]
): Route<ParentParams | OwnParams>;

export function defineSubRoute<
  ParentParams extends string,
  OwnParams extends string
>(
  parent: Route<ParentParams>,
  subPath: string,
  params: OwnParams[] = []
): Route<ParentParams | OwnParams> {
  const path = `${parent.path}${normalizePath(subPath)}`;
  return {
    path,
    generate: (params: { [k in ParentParams & OwnParams]: string }) =>
      generatePath(path, params),
  };
}

export function useRouteParams<Params extends string>(route: Route<Params>) {
  return useParams<{ [k in Params]: string }>();
}

function normalizePath(path: string) {
  return (
    "/" +
    path
      .trim()
      .replace(/^(\/+)/, "")
      .replace(/(\/+)$/, "")
  );
}
