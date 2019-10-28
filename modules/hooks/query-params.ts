import { forEach, fromPairs } from "lodash-es";
import { useCallback, useMemo } from "react";
import { useHistory, useLocation } from "react-router";
import { Isomorphism } from "@atomic-object/lenses";

export const useQueryParams = <K extends string>(
  ks: K[]
): [
  Record<K, string | null>,
  (newParams: Partial<Record<K, string | null>>) => void
] => {
  const history = useHistory();
  const location = useLocation();
  const urlSearch = useMemo(() => new URLSearchParams(location.search), [
    location,
  ]);
  const params = useMemo(
    () =>
      fromPairs(ks.map(k => [k, urlSearch.get(k)])) as Record<K, string | null>,
    [urlSearch, ks]
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

export const useQueryIso = <K extends string, T>(
  ks: K[],
  iso: Isomorphism<Record<K, string | null>, T>
): [T, (newT: Partial<T>) => void] => {
  const [raw, rawSet] = useQueryParams(ks);
  const t = useMemo(() => iso.to(raw), [raw, iso]);
  const update = useCallback(
    (nT: Partial<T>) => rawSet(iso.from({ ...t, ...nT })),
    [rawSet, iso, t]
  );
  return [t, update];
};

type PaginationQueryParams = {
  page: string | null;
  limit: string | null;
};
type PaginationSettings = {
  page: number;
  limit: number;
};
export const PaginationParams: Isomorphism<
  PaginationQueryParams,
  PaginationSettings
> = {
  to: k => ({
    page: Number(k.page) || 0,
    limit: Number(k.limit) || 10,
  }),
  from: s => ({
    page: s.page.toString(),
    limit: s.limit.toString(),
  }),
};
