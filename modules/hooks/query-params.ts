import { Isomorphism } from "@atomic-object/lenses";
import { mapValues, forEach } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router";

export const useQueryParams = <K extends string>(
  defaults: Record<K, string>
): [Record<K, string>, (newParams: Partial<Record<K, string>>) => void] => {
  const history = useHistory();
  const location = useLocation();
  const params = useMemo(() => {
    const urlSearch = new URLSearchParams(location.search);
    return mapValues(defaults, (v, k) => urlSearch.get(k) ?? v);
  }, [location.search, defaults]);
  const update = useCallback(
    (newParams: Partial<Record<K, string | null>>) => {
      const params = new URLSearchParams(location.search);
      forEach(newParams, (v, k) => {
        if (typeof v === "string") {
          params.set(k, v);
        } else {
          params.delete(k);
        }
      });
      history.push({ ...location, search: params.toString() });
    },
    [location, history]
  );
  return [params, update];
};

export type QueryIso<K extends string, T> = {
  defaults: Record<K, string>;
  iso: Isomorphism<Record<K, string>, T>;
};

function merge<T>(t: T, nT: Partial<T>): T {
  if (typeof t === "object") {
    return { ...t, ...nT };
  }
  return nT as T;
}

export const useQueryParamIso = <K extends string, T>(
  queryIso: QueryIso<K, T>
): [T, (newT: Partial<T>) => void] => {
  const { defaults, iso } = queryIso;
  const [raw, rawSet] = useQueryParams(defaults);
  const t = useMemo(() => iso.to(raw), [raw, iso]);
  const update = useCallback(
    (nT: Partial<T>) => rawSet(iso.from(merge(t, nT))),
    [rawSet, iso, t]
  );
  return [t, update];
};

export const PaginationQueryParamDefaults = {
  page: "1",
  limit: "10",
};
export type PaginationSettings = {
  page: number;
  limit: number;
};
export const PaginationParams: Isomorphism<
  typeof PaginationQueryParamDefaults,
  PaginationSettings
> = {
  to: k => ({
    page: Number(k.page),
    limit: Number(k.limit),
  }),
  from: s => ({
    page: s.page.toString(),
    limit: s.limit.toString(),
  }),
};

export const makeQueryIso = <K extends string, T>(v: QueryIso<K, T>) => v;

export const PaginationQueryParams = makeQueryIso({
  defaults: PaginationQueryParamDefaults,
  iso: PaginationParams,
});
