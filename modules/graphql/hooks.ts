import { QueryResult } from "@apollo/react-common";
import {
  MutationHookOptions,
  MutationTuple,
  LazyQueryHookOptions,
  QueryHookOptions,
  useMutation,
  useQuery,
  useLazyQuery,
} from "@apollo/react-hooks";
import {
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  NetworkStatus,
  ObservableQuery,
  OperationVariables,
} from "apollo-client";
import { DocumentNode } from "graphql";
import {
  PaginationQueryParams,
  PaginationSettings,
  QueryIso,
  useQueryParamIso,
} from "hooks/query-params";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useLoadingState } from "ui/components/loading-state";
import { GraphqlBundle } from "./core";

type NonOptional<O> = O extends null | undefined | infer T ? T : O;

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
  | ({ state: "LOADING"; skipped: boolean } & QueryExtras<TResult, TVars>)
  // Updating, but we have data to show. Usually render this.
  | ({ state: "UPDATING" } & QueryBaseResult<TResult, TVars>)
  // Loaded. We have data to show
  | ({ state: "DONE" } & QueryBaseResult<TResult, TVars>)
  | ({ state: "ERROR" } & QueryBaseResult<TResult, TVars>);

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

  const isPollingQuery = options?.pollInterval && options.pollInterval > 0;
  const isLoading =
    !(options && options.skip) &&
    (ourResult.state === "LOADING" || ourResult.state === "UPDATING");
  const startLoadingState = useLoadingState().start;
  useEffect(() => {
    if (isLoading && !isPollingQuery)
      return startLoadingState(false, `useQueryBundle()`);
  }, [isLoading, isPollingQuery, startLoadingState]);
  if (ourResult.state == "ERROR") {
    const isUnauthorized =
      ourResult.error &&
      ourResult.error.networkError &&
      (ourResult.error.networkError as any).statusCode === 403;
    if (!isUnauthorized && !options?.onError) {
      throw new Error(`Query failed: ${rawResult.error}`);
    }
  }
  return ourResult;
}

type QueryPaginationVars = {
  offset?: number | null;
  limit?: number | null;
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
  resetPage: () => void;
  setResultsPerPage: (resultsPerPage: number) => void;
};

/**
 * Wrap a query bundle so that the `limit` and `offset` variables are automatically
 * supplied to the query's input variables. These values are taken from query params
 * on the URL.
 *
 * Additionally, this hook takes care of managing pagination state for you.
 *
 * @param query a query bundle
 * @param totalCount a lambda that extracts the `totalCount` from the query result
 * @param options see useQueryBundle() for details
 * @param queryParams optional: a query param iso for extracting limit and offset.
 */
export function usePagedQueryBundle<Result, Vars extends QueryPaginationVars>(
  query: GraphqlBundle<Result, Vars>,
  totalCount: (r: Result) => number | null | undefined,
  options: QueryHookOptions<Result, Vars>,
  queryParams: QueryIso<string, PaginationSettings> = PaginationQueryParams
): [HookQueryResult<Result, Vars>, PaginationInfo] {
  const [lastCount, setLastCount] = useState(0);
  const [params, setParams] = useQueryParamIso(queryParams);
  const ovars = options.variables;
  if (!ovars) {
    throw Error("variables are required");
  }
  const vars = {
    ...ovars,
    limit: params.limit,
    offset: params.limit * (params.page - 1),
  };
  const mergedOptions: QueryHookOptions<Result, Vars> = {
    ...options,
    variables: vars,
  };
  const result = useQueryBundle(query, mergedOptions);
  let countFromQueryResult: number | null | undefined = null;
  if (result.state === "DONE" || result.state === "UPDATING") {
    countFromQueryResult = totalCount(result.data);
  }
  useEffect(() => {
    if (typeof countFromQueryResult === "number")
      setLastCount(countFromQueryResult);
  }, [countFromQueryResult]);
  const count = countFromQueryResult || lastCount;
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
      resetPage: () => {
        if (currentPage != 1) {
          setParams({ page: 1 });
        }
      },
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

// This hook will execute a query on demand
// It is a workaround for the Apollo useLazyQuery which does not return a promise
export function useImperativeQuery<Result, Vars>(
  query: GraphqlBundle<Result, Vars>,
  options: QueryHookOptions<Result, Vars> = {}
): QueryResult<Result, Vars>["refetch"] {
  const { refetch } = useQueryBundle<Result, Vars>(query, {
    ...options,
    skip: true,
  });

  const imperativelyCallQuery = (queryVariables: Vars) => {
    return refetch(queryVariables);
  };

  return imperativelyCallQuery;
}

// from https://github.com/apollographql/react-apollo/issues/3499#issuecomment-537748212
// useLazyQuery with an awaitable result

export type LazyQueryResult<TData> = QueryResult<TData>;

export type LazyQueryExecute<TData, TVariables> = (
  variables?: TVariables | undefined,
  context?: any
) => Promise<LazyQueryResult<TData>>;

type LazyQueryHookTuple<TData, TVariables> = [
  LazyQueryExecute<TData, TVariables>,
  LazyQueryResult<TData>
];

export function useLazyQueryPromise<
  TData = any,
  TVariables = OperationVariables
>(
  query: DocumentNode,
  options?: LazyQueryHookOptions<TData, TVariables>
): LazyQueryHookTuple<TData, TVariables> {
  const [execute, result] = useLazyQuery<TData, TVariables>(query, options);

  const resolveRef = useRef<
    (
      value?: LazyQueryResult<TData> | PromiseLike<LazyQueryResult<TData>>
    ) => void
  >();

  useEffect(() => {
    if (result.called && !result.loading && resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = undefined;
    }
  }, [result.loading, result.called]);

  const queryLazily: LazyQueryExecute<TData, TVariables> = useCallback(
    (variables, context) => {
      execute({ variables, context });
      return new Promise<LazyQueryResult<TData>>(resolve => {
        resolveRef.current = resolve;
      });
    },
    [execute]
  );

  return [queryLazily, result];
}
