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
    path,
    generate: (params: { [k in Params]: string }) => generatePath(path, params),
  };
}

export function defineSubRoute<
  ParentParams extends string,
  OwnParams extends string
>(
  parent: Route<ParentParams>,
  subPath: string,
  params: OwnParams[] = []
): Route<ParentParams | OwnParams> {
  const path = `${parent.path}${subPath}`;
  return {
    path,
    generate: (params: { [k in ParentParams & OwnParams]: string }) =>
      generatePath(path, params),
  };
}

export function useRouteParams<Params extends string>(route: Route<Params>) {
  return useParams<{ [k in Params]: string }>();
}
