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
import { useQueryParams } from "hooks/query-params";

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

type PagedVars = {
  offset: number;
  limit: number;
};
export function usePagedQueryBundle<Result, Vars extends PagedVars>(
  query: GraphqlBundle<Result, Vars>,
  options?: QueryHookOptions<Result, Omit<Vars, "offset" | "limit">>
): HookQueryResult<Result, Vars> {
  const [params, setParams] = useQueryParams(["limit", "page"]);
  params.limit; // = "5"

  //   const [limit, setLimit] = useState(10);
  //   const [offset, setOffset] = useState(0);
  //   const [params, updateParams] = useQueryParams();
  //   const vars = options?.variables;
  //   if (!vars) {
  //     throw Error("variables are required");
  //   }
  //   const pagedVars: Vars = {...vars, limit, offset};
  //   const mergedOptions: QueryHookOptions<Result,Vars> = {
  //     ...options,
  //     variables: {...options?.variables, limit, offset},
  //   }
  // const wat2 = useLocation();
  // const parms = new URLSearchParams(wat2.search)
  // parms.has("q");
  // parms.set("q", "oh yeah");
  // const history = useHistory();
  // history.push({
  //   ...wat2,
  //   search: parms.toString(),
  // })
  const wat = useQueryBundle(query, options);
  return wat;
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
