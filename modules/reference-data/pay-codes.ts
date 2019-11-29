import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetPayCodes } from "./get-pay-codes.gen";
import { useMemo } from "react";

export function usePayCodes(orgId: string) {
  const payCodes = useQueryBundle(GetPayCodes, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (payCodes.state === "DONE" && payCodes.data.orgRef_PayCode) {
      return compact(payCodes.data.orgRef_PayCode.all) ?? [];
    }
    return [];
  }, [payCodes]);
}
