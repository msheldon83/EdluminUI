import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetPermissionDefinitions } from "./get-permission-definitions.gen";
import { useMemo } from "react";

export function usePermissionDefinitions(role: string | undefined) {
  const permissionDefinitions = useQueryBundle(GetPermissionDefinitions, {
    fetchPolicy: "cache-first",
    variables: { role },
    skip: role === undefined,
  });

  return useMemo(() => {
    if (
      permissionDefinitions.state === "DONE" &&
      permissionDefinitions.data?.permission
    ) {
      return (
        compact(permissionDefinitions.data.permission.definition.categories) ??
        []
      );
    }
    return [];
  }, [permissionDefinitions]);
}
