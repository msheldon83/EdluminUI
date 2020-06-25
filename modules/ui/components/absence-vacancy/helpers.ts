import {
  AccountingCodeValue,
  noAllocation,
  singleAllocation,
  multipleAllocations,
} from "../form/accounting-code-dropdown";
import { VacancyDetailAccountingCodeInput } from "graphql/server-types.gen";
import { isEqual } from "lodash-es";

export const accountingCodeAllocationsAreTheSame = (
  accountingCodeAllocationsToCompare: {
    accountingCodeId?: string | null | undefined;
    allocation: number;
  }[],
  allAccountingCodeAllocations: {
    accountingCodeId?: string | null | undefined;
    allocation: number;
  }[][]
) => {
  for (let i = 0; i < allAccountingCodeAllocations.length; i++) {
    const allocations = allAccountingCodeAllocations[i];

    if (allocations.length !== accountingCodeAllocationsToCompare.length) {
      // Difference in the number of Accounting Codes
      return false;
    }

    if (
      !isEqual(
        allocations.sort(
          (a, b) => +(a.accountingCodeId ?? 0) - +(b.accountingCodeId ?? 0)
        ),
        accountingCodeAllocationsToCompare.sort(
          (a, b) => +(a.accountingCodeId ?? 0) - +(b.accountingCodeId ?? 0)
        )
      )
    ) {
      // Different accounting code lists
      return false;
    }
  }

  return true;
};

export const mapAccountingCodeValueToVacancyDetailAccountingCodeInput = (
  accountingCodeAllocations: AccountingCodeValue | null | undefined
): VacancyDetailAccountingCodeInput[] => {
  if (!accountingCodeAllocations) {
    return [];
  }

  switch (accountingCodeAllocations.type) {
    case "no-allocation":
      return [];
    case "single-allocation":
      return [
        {
          accountingCodeId: accountingCodeAllocations.selection?.value?.toString(),
          allocation: 1,
        },
      ];
    case "multiple-allocations":
      return accountingCodeAllocations.allocations
        .filter(a => a.selection?.value && a.percentage)
        .map(a => {
          return {
            accountingCodeId: a.selection?.value?.toString(),
            allocation: (a.percentage ?? 0) / 100,
          };
        });
  }
};

export const mapAccountingCodeAllocationsToAccountingCodeValue = (
  accountingCodeAllocations:
    | {
        accountingCodeId: string;
        accountingCodeName: string | undefined;
        allocation?: number;
      }[]
    | null
    | undefined
): AccountingCodeValue => {
  if (!accountingCodeAllocations || accountingCodeAllocations.length === 0) {
    return noAllocation();
  }

  if (accountingCodeAllocations.length === 1) {
    return singleAllocation({
      label: accountingCodeAllocations[0].accountingCodeName ?? "",
      value: accountingCodeAllocations[0].accountingCodeId,
    });
  }

  return multipleAllocations(
    accountingCodeAllocations.map(a => {
      return {
        id: Math.random(),
        selection: {
          label: a.accountingCodeName ?? "",
          value: a.accountingCodeId,
        },
        percentage: a.allocation ? a.allocation * 100 : undefined,
      };
    })
  );
};
