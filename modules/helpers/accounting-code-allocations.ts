import { VacancyDetailAccountingCodeInput } from "graphql/server-types.gen";
import { isEqual, sum } from "lodash-es";
import {
  AccountingCodeValue,
  noAllocation,
  singleAllocation,
  multipleAllocations,
} from "ui/components/form/accounting-code-dropdown";
import { TFunction } from "i18next";

export type AccountingCodeAllocation = {
  accountingCodeId: string;
  accountingCodeName?: string | undefined;
  allocation: number;
};

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

export const mapAccountingCodeValueToAccountingCodeAllocations = (
  accountingCodeAllocations: AccountingCodeValue | null | undefined,
  returnEmptyIfInvalid?: boolean,
  setName?: boolean
): AccountingCodeAllocation[] => {
  if (!accountingCodeAllocations) {
    return [];
  }

  let allocations: AccountingCodeAllocation[] = [];
  switch (accountingCodeAllocations.type) {
    case "no-allocation":
      allocations = [];
      break;
    case "single-allocation":
      allocations = [
        {
          accountingCodeId:
            accountingCodeAllocations.selection?.value?.toString() ?? "",
          allocation: 1,
          accountingCodeName: setName
            ? accountingCodeAllocations.selection?.label
            : undefined,
        },
      ];
      break;
    case "multiple-allocations":
      allocations = accountingCodeAllocations.allocations.map(a => {
        return {
          accountingCodeId: a.selection?.value?.toString() ?? "",
          allocation: (a.percentage ?? 0) / 100,
          accountingCodeName: setName ? a.selection?.label : undefined,
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
  accountingCodeAllocations: AccountingCodeAllocation[] | null | undefined
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

// Return a string if there is a validation error, otherwise return undefined
export const validateAccountingCodeAllocations = (
  accountingCodeAllocations: AccountingCodeAllocation[],
  t: TFunction
): string | undefined => {
  if (!accountingCodeAllocations || accountingCodeAllocations.length === 0) {
    return undefined;
  }

  if (
    accountingCodeAllocations.filter(a => !a.accountingCodeId || !a.allocation)
      .length > 0
  ) {
    return t("Accounting code selections not complete");
  }

  if (sum(accountingCodeAllocations.map(a => a.allocation)) !== 1) {
    // Allocations need to add up to 100%
    return t("Accounting code allocations do not total 100%");
  }

  return undefined;
};

export const accountingCodeValuesAreEqual = (
  value: AccountingCodeValue,
  toCompare: AccountingCodeValue
) => {
  if (value.type === "no-allocation" && toCompare.type === "no-allocation") {
    return true;
  }

  if (
    value.type === "single-allocation" &&
    toCompare.type === "single-allocation" &&
    value.selection?.value === toCompare.selection?.value
  ) {
    return true;
  }

  if (
    value.type === "multiple-allocations" &&
    toCompare.type === "multiple-allocations"
  ) {
    const valueAllocations = value.allocations.map(a => {
      return {
        accountingCodeId: a.selection?.value,
        allocation: a.percentage,
      };
    });
    const toCompareAllocations = toCompare.allocations.map(a => {
      return {
        accountingCodeId: a.selection?.value,
        allocation: a.percentage,
      };
    });

    if (valueAllocations.length !== toCompareAllocations.length) {
      // Different number of allocations between the 2
      return false;
    }

    if (
      isEqual(
        valueAllocations.sort(
          (a, b) => +(a.accountingCodeId ?? 0) - +(b.accountingCodeId ?? 0)
        ),
        toCompareAllocations.sort(
          (a, b) => +(a.accountingCodeId ?? 0) - +(b.accountingCodeId ?? 0)
        )
      )
    ) {
      // Same lists
      return true;
    }
  }

  return false;
};

export const allAccountingCodeValuesAreEqual = (
  values: AccountingCodeValue[]
) => {
  if (values.length === 0) {
    return true;
  }

  const toCompare = values[0];
  for (let index = 0; index < values.length; index++) {
    const element = values[index];
    if (!accountingCodeValuesAreEqual(element, toCompare)) {
      return false;
    }
  }

  return true;
};
