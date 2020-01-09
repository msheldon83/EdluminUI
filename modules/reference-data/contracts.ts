import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAllContracts } from "./get-contracts.gen";
import { useMemo } from "react";

export function useContracts(orgId: string | undefined) {
  const contracts = useQueryBundle(GetAllContracts, {
    fetchPolicy: "cache-first",
    variables: { orgId },
    skip: orgId === undefined,
  });

  return useMemo(() => {
    if (contracts.state === "DONE" && contracts.data?.contract) {
      return compact(contracts.data.contract.all) ?? [];
    }
    return [];
  }, [contracts]);
}
