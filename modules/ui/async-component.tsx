import * as React from "react";
import { lazy, Suspense } from "react";
import { LoadingStateTrigger } from "./components/loading-state/loading-state-trigger";
import { compact } from "lodash";

export interface AsyncComponentArgs<C extends React.ComponentType<any>> {
  resolve: () => Promise<C>;
  name?: string;
}

/** this is meant to be a drop-in replacement for
 * "react-async-component". there's likely opportunity to improve the
 * overall API. we may need to do that when we do loading states...
 */
export function asyncComponent<C extends React.ComponentType<any>>(
  args: AsyncComponentArgs<C>
): C {
  const Comp = lazy(async () => ({ default: await args.resolve() }));
  const Wrapped = (props: any) => (
    <Suspense fallback={<LoadingStateTrigger fullScreen />}>
      <Comp {...props} />
    </Suspense>
  );
  Wrapped.displayName = args.name;
  return Wrapped as C;
}
