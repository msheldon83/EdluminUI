import { useQueryBundle } from "graphql/hooks";
import { compact } from "lodash-es";
import { GetAccountingCodes } from "./get-accounting-codes.gen";
import { useMemo } from "react";

export function useAccountingCodes(
  orgId: string | undefined,
  locationIds?: string[]
) {
  const accountingCodes = useQueryBundle(GetAccountingCodes, {
    fetchPolicy: "cache-first",
    variables: { orgId: orgId ?? "", locationIds },
    skip: orgId === undefined,
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

export function useAccountingCodeOptions(orgId: string | undefined) {
  const accountingCodes = useAccountingCodes(orgId);

  return useMemo(
    () =>
      accountingCodes.map(l => ({
        label: l.name,
        value: l.id,
      })),
    [accountingCodes]
  );
}
