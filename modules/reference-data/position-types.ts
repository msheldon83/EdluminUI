import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetPositionTypes } from "./get-position-types.gen";

export function usePositionTypes(orgId: string) {
  const positionTypes = useQueryBundle(GetPositionTypes, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });
  if (positionTypes.state === "DONE" && positionTypes.data.positionType) {
    return compact(positionTypes.data.positionType.all) ?? [];
  }
  return [];
}
