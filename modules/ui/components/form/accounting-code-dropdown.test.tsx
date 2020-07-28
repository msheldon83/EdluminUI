import * as React from "react";
import { render, fireEvent } from "helpers/test-utils";
import {
  AccountingCodeDropdown,
  AccountingCodeValue,
} from "./accounting-code-dropdown";

const AccountingCodeDropdownComponent = () => {
  const options = [
    {
      label: "allocation one",
      value: "1",
    },
    {
      label: "allocation two",
      value: "2",
    },
  ];

  const [accountCode, setAccountingCode] = React.useState<AccountingCodeValue>({
    type: "no-allocation",
    selection: undefined,
  });

  return (
    <AccountingCodeDropdown
      value={accountCode}
      options={options}
      onChange={setAccountingCode}
    />
  );
};

test("selects a single alloaction", () => {
  const { getByPlaceholderText, getByText } = render(
    <AccountingCodeDropdownComponent />
  );

  const dropdownNode = getByPlaceholderText("Select code") as HTMLInputElement;
  fireEvent.focus(dropdownNode);

  const allocationRowNode = getByText("allocation one");
  fireEvent.click(allocationRowNode);

  expect(dropdownNode.value).toBe("allocation one");
});

describe("multiple allocations", () => {
  test("displays one allocation by default", () => {
    const { getByPlaceholderText, getAllByPlaceholderText, getByText } = render(
      <AccountingCodeDropdownComponent />
    );

    const dropdownNode = getByPlaceholderText("Select code");
    fireEvent.focus(dropdownNode);

    const allocationRowNode = getByText("Multiple allocations");
    fireEvent.click(allocationRowNode);

    const accountingCodeDropdownNodes = getAllByPlaceholderText(
      "Select accounting code"
    );

    expect(accountingCodeDropdownNodes.length).toBe(1);
  });

  test("adds a new allocation input", () => {
    const { getByPlaceholderText, getByText, getAllByPlaceholderText } = render(
      <AccountingCodeDropdownComponent />
    );

    const dropdownNode = getByPlaceholderText("Select code");
    fireEvent.focus(dropdownNode);

    const allocationRowNode = getByText("Multiple allocations");
    fireEvent.click(allocationRowNode);

    const addAllocationButtonNode = getByText("Add Allocation");
    fireEvent.click(addAllocationButtonNode);

    const accountingCodeDropdownNodes = getAllByPlaceholderText(
      "Select accounting code"
    );

    expect(accountingCodeDropdownNodes.length).toBe(2);
  });

  test("removes an allocation input", () => {
    const {
      getByPlaceholderText,
      getByText,
      getAllByPlaceholderText,
      getAllByRole,
    } = render(<AccountingCodeDropdownComponent />);

    const dropdownNode = getByPlaceholderText("Select code");
    fireEvent.focus(dropdownNode);

    const allocationRowNode = getByText("Multiple allocations");
    fireEvent.click(allocationRowNode);

    const addAllocationButtonNode = getByText("Add Allocation");
    fireEvent.click(addAllocationButtonNode);

    const accountingCodeDropdownNodesBefore = getAllByPlaceholderText(
      "Select accounting code"
    );

    expect(accountingCodeDropdownNodesBefore.length).toBe(2);

    const deleteAllocationButtonNode = getAllByRole("button", {
      name: "delete",
    });
    fireEvent.click(deleteAllocationButtonNode[0]);

    const accountingCodeDropdownNodesAfter = getAllByPlaceholderText(
      "Select accounting code"
    );

    expect(accountingCodeDropdownNodesAfter.length).toBe(1);
  });

  test("removes the multiple allocation split and resets", () => {
    const { getByPlaceholderText, getAllByPlaceholderText, getByText } = render(
      <AccountingCodeDropdownComponent />
    );

    const dropdownNode = getByPlaceholderText(
      "Select code"
    ) as HTMLInputElement;
    fireEvent.focus(dropdownNode);

    const allocationRowNode = getByText("Multiple allocations");
    fireEvent.click(allocationRowNode);

    expect(dropdownNode.value).toBe("Multiple allocations");

    const removeSplitButtonNode = getByText("Remove Split");
    fireEvent.click(removeSplitButtonNode);

    expect(dropdownNode.value).toBe("");
  });
});
