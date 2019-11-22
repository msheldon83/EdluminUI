import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAccountingCodes } from "./get-accounting-codes.gen";
import { useMemo } from "react";

export function useAccountingCodes(orgId: string) {
  const accountingCodes = useQueryBundle(GetAccountingCodes, {
    fetchPolicy: "cache-first",
    variables: { orgId },
  });

  return useMemo(() => {
    if (
      accountingCodes.state === "DONE" &&
      accountingCodes.data.orgRef_AccountingCode
    ) {
      return compact(accountingCodes.data.orgRef_AccountingCode.all) ?? [];
    }
    return [];
  }, [accountingCodes]);
}
