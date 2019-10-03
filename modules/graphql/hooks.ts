import {
  ApolloQueryResult,
  FetchMoreOptions,
  FetchMoreQueryOptions,
  NetworkStatus,
  ObservableQuery,
} from "apollo-client";
import { useMemo } from "react";
import { GraphqlBundle } from "./core";
import {
  useMutation,
  MutationHookOptions,
  MutationTuple,
  useQuery,
  QueryHookOptions,
} from "@apollo/react-hooks";
import { QueryResult } from "@apollo/react-common";
import { useLoadingIndicator } from "ui/components/page-loading-indicator";
import { useAuth0 } from "auth/auth0";

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
  const authState = useAuth0();
  let authorization = "";
  if (!authState.loading && authState.isAuthenticated && authState.token) {
    authorization = `Bearer ${authState.token}`;
  }
  const rawResult = useQuery<Result, Vars>(query.Document, {
    ...options,
    skip: authState.loading,
    context: {
      headers: { Authorization: authorization },
    },
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
  const authState = useAuth0();
  let authorization = "";
  if (!authState.loading && authState.isAuthenticated && authState.token) {
    authorization = `Bearer ${authState.claims && authState.claims.__raw}${
      authState.token
    }`;
  }
  const [func, result] = useMutation(mutation.Document, {
    ...options,
    context: { headers: { Authorization: authorization } },
  });

  // This may be too aggressive, but if this works well it'll be easy to provide
  // other options
  return [useLoadingIndicator(func), result];
}
