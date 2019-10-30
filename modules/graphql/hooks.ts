import { QueryResult } from "@apollo/react-common";
import {
  MutationHookOptions,
  MutationTuple,
  QueryHookOptions,
  useMutation,
  useQuery,
} from "@apollo/react-hooks";
import {
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  NetworkStatus,
  ObservableQuery,
} from "apollo-client";
import { useCallback, useMemo, useEffect, useState } from "react";
import { useLoadingState } from "ui/components/loading-state";
import { GraphqlBundle } from "./core";
import { useLocation, useHistory } from "react-router";
import {
  useQueryParams,
  useQueryParamIso,
  PaginationQueryParams,
} from "hooks/query-params";

type NonOptional<O> = O extends null | undefined | (infer T) ? T : O;

/** Extra query stuff we get from apollo hooks. */
type QueryExtras<TData, TVariables> = Pick<
  ObservableQuery<TData, TVariables>,
  "refetch" | "startPolling" | "stopPolling" | "updateQuery"
> & {
  fetchMore<K extends keyof TVariables>(
    fetchMoreOptions: FetchMoreQueryOptions<TVariables, K> &
      FetchMoreOptions<TData, TVariables>
  ): Promise<ApolloQueryResult<TData>>;
};

type QueryBaseResult<TData, TVariables> = Omit<
  QueryResult<TData, TVariables>,
  "data"
> & {
  data: TData;
} & QueryExtras<TData, TVariables>;

export type HookQueryResult<TResult, TVars> =
  // Initial loading state. No data to show.
  // Skipped is a key on the loading type to avoid having two types returning QueryExtras
  // (which doesn't have the data key)
  | { state: "LOADING"; skipped: boolean } & QueryExtras<TResult, TVars>
  // Updating, but we have data to show. Usually render this.
  | { state: "UPDATING" } & QueryBaseResult<TResult, TVars>
  // Loaded. We have data to show
  | { state: "DONE" } & QueryBaseResult<TResult, TVars>
  | { state: "ERROR" } & QueryBaseResult<TResult, TVars>;

export function useQueryBundle<Result, Vars>(
  query: GraphqlBundle<Result, Vars>,
  options?: QueryHookOptions<Result, Vars>
): HookQueryResult<Result, Vars> {
  const rawResult = useQuery<Result, Vars>(query.Document, {
    ...options,
  });

  const ourResult = useMemo<HookQueryResult<Result, Vars>>((): any => {
    if (rawResult.error || rawResult.networkStatus === NetworkStatus.error) {
      return { state: "ERROR", ...rawResult };
    } else if (!rawResult.data || Object.keys(rawResult.data).length == 0) {
      if (options && options.skip) {
        return { state: "LOADING", skipped: true, ...rawResult };
      }
      return { state: "LOADING", skipped: false, ...rawResult };
    } else if (rawResult.loading) {
      return { state: "UPDATING", ...rawResult };
    } else {
      return { state: "DONE", ...rawResult };
    }
  }, [rawResult, options]);

  const isLoading =
    !(options && options.skip) &&
    (ourResult.state === "LOADING" || ourResult.state === "UPDATING");
  const startLoadingState = useLoadingState().start;
  useEffect(() => {
    if (isLoading) return startLoadingState(false, `useQueryBundle()`);
  }, [isLoading, startLoadingState]);

  if (ourResult.state == "ERROR") {
    const isUnauthorized =
      ourResult.error &&
      ourResult.error.networkError &&
      (ourResult.error.networkError as any).statusCode === 403;
    if (!isUnauthorized) {
      throw new Error(`Query failed: ${rawResult.error}`);
    }
  }
  return ourResult;
}

type QueryPaginationVars = {
  offset: number;
  limit: number;
};

export type PaginationInfo = {
  /** currentPage starts at 1 */
  currentPage: number;
  totalPages: number;
  totalCount: number;
  resultsPerPage: number;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
  setResultsPerPage: (resultsPerPage: number) => void;
};

export function usePagedQueryBundle<Result, Vars>(
  query: GraphqlBundle<Result, Vars & QueryPaginationVars>,
  totalCount: (r: Result) => number,
  options: QueryHookOptions<Result, Vars>
): [HookQueryResult<Result, Vars>, PaginationInfo] {
  const [params, setParams] = useQueryParamIso(PaginationQueryParams);
  const ovars = options.variables;
  if (!ovars) {
    throw Error("variables are required");
  }
  const vars = {
    ...ovars,
    limit: params.limit,
    offset: params.limit * (params.page - 1),
  };
  const mergedOptions: QueryHookOptions<Result, Vars & QueryPaginationVars> = {
    ...options,
    variables: vars,
  };
  const result = useQueryBundle(query, mergedOptions);
  let count = 0;
  if (result.state === "DONE" || result.state === "UPDATING") {
    count = totalCount(result.data);
  }
  const currentPage = params.page;
  const totalPages = Math.max(1, Math.ceil(count / params.limit));
  const paginationInfo: PaginationInfo = useMemo(
    () => ({
      currentPage,
      totalPages,
      totalCount: count,
      resultsPerPage: params.limit,
      nextPage: () =>
        setParams({ page: Math.min(currentPage + 1, totalPages) }),
      previousPage: () => setParams({ page: Math.max(currentPage - 1, 1) }),
      goToPage: page =>
        setParams({ page: Math.max(1, Math.min(totalPages, page)) }),
      setResultsPerPage: r => setParams({ limit: r, page: 1 }),
    }),
    [setParams, currentPage, totalPages, count, params.limit]
  );
  return [result, paginationInfo];
}

export function useMutationBundle<T, TVariables>(
  mutation: GraphqlBundle<T, TVariables>,
  options?: MutationHookOptions<T, TVariables>
): MutationTuple<T, TVariables> {
  const notifyLoading = useLoadingState().start;
  const [func, result] = useMutation(mutation.Document, {
    ...options,
  });

  const loadingWrappedFunc: typeof func = useCallback(
    async opts => {
      const stop = notifyLoading(false, "useMutationBundle()");
      try {
        const v = await func(opts);
        return v;
      } finally {
        stop();
      }
    },
    [func, notifyLoading]
  );

  return [loadingWrappedFunc, result];
}
