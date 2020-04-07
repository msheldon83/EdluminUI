import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetPositionTypes } from "./get-position-types.gen";
import { useMemo } from "react";

export function usePositionTypes(orgId?: string) {
  const positionTypes = useQueryBundle(GetPositionTypes, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (positionTypes.state === "DONE" && positionTypes.data.positionType) {
      return compact(positionTypes.data.positionType.all) ?? [];
    }
    return [];
  }, [positionTypes]);
}

export function usePositionTypeOptions(orgId: string | undefined) {
  const positionTypes = usePositionTypes(orgId);

  return useMemo(
    () =>
      positionTypes.map(pt => ({
        label: pt.name,
        value: pt.id,
      })),
    [positionTypes]
  );
}
