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
import { useCallback, useMemo, useEffect } from "react";
import { useLoadingState } from "ui/components/loading-state";
import { GraphqlBundle } from "./core";

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
    ourResult.state === "LOADING" || ourResult.state === "UPDATING";
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
      const v = await func(opts);
      stop();
      return v;
    },
    [func, notifyLoading]
  );

  return [loadingWrappedFunc, result];
}
