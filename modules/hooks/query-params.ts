import { Isomorphism } from "@atomic-object/lenses";
import { mapValues } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router";

export const useQueryParams = <K extends string>(
  defaults: Record<K, string>
): [Record<K, string>, (newParams: Partial<Record<K, string>>) => void] => {
  const history = useHistory();
  const location = useLocation();
  const urlSearch = useMemo(() => new URLSearchParams(location.search), [
    location,
  ]);
  const params = useMemo(
    () => mapValues(defaults, (v, k) => urlSearch.get(k) ?? v),
    [urlSearch, defaults]
  );
  const update = useCallback(
    (newParams: Partial<Record<K, string | null>>) => {
      const params = new URLSearchParams(location.search);
      for (const key in newParams) {
        const v = newParams[key];
        if (typeof v === "string") {
          params.set(key, v);
        } else {
          params.delete(key);
        }
      }
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

export const useQueryParamIso = <K extends string, T>(
  queryIso: QueryIso<K, T>
): [T, (newT: Partial<T>) => void] => {
  const { defaults, iso } = queryIso;
  const [raw, rawSet] = useQueryParams(defaults);
  const t = useMemo(() => iso.to(raw), [raw, iso]);
  const update = useCallback(
    (nT: Partial<T>) => rawSet(iso.from({ ...t, ...nT })),
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
const PaginationParams: Isomorphism<
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

const makeQueryIso = <K extends string, T>(v: QueryIso<K, T>) => v;

export const PaginationQueryParams = makeQueryIso({
  defaults: PaginationQueryParamDefaults,
  iso: PaginationParams,
});
