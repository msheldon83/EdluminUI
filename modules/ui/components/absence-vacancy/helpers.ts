import {
  AccountingCodeValue,
  noAllocation,
  singleAllocation,
  multipleAllocations,
} from "../form/accounting-code-dropdown";
import { VacancyDetailAccountingCodeInput } from "graphql/server-types.gen";
import { isEqual, sum } from "lodash-es";

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
  accountingCodeAllocations: AccountingCodeValue | null | undefined,
  returnEmptyIfInvalid: boolean
): VacancyDetailAccountingCodeInput[] => {
  if (!accountingCodeAllocations) {
    return [];
  }

  let allocations: VacancyDetailAccountingCodeInput[] = [];
  switch (accountingCodeAllocations.type) {
    case "no-allocation":
      allocations = [];
      break;
    case "single-allocation":
      allocations = [
        {
          accountingCodeId: accountingCodeAllocations.selection?.value?.toString(),
          allocation: 1,
        },
      ];
      break;
    case "multiple-allocations":
      allocations = accountingCodeAllocations.allocations
        .filter(a => a.selection?.value && a.percentage)
        .map(a => {
          return {
            accountingCodeId: a.selection?.value?.toString(),
            allocation: (a.percentage ?? 0) / 100,
          };
        });
      break;
  }

  if (returnEmptyIfInvalid) {
    // Validate the data we would create is valid, otherwise return an empty array
    if (
      allocations.filter(a => !a.accountingCodeId || !a.allocation).length > 0
    ) {
      return [];
    }

    if (sum(allocations.map(a => a.allocation)) !== 1) {
      // Allocations need to add up to 100%
      return [];
    }
  }

  return allocations;
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
        percentage: a.allocation ? Math.floor(a.allocation * 100) : undefined,
      };
    })
  );
};
