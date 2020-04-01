import * as React from "react";
import { render, fireEvent } from "helpers/test-utils";
import { Input } from "./input";

test("renders with a label", () => {
  const { getByLabelText } = render(<Input label="Test Label" />);
  const inputNode = getByLabelText("Test Label");

  expect(inputNode).toBeDefined();
});

test("handles onchange events", () => {
  const handleChange = jest.fn();

  const { getByLabelText } = render(
    <Input label="Test Label" onChange={handleChange} />
  );
  const inputNode = getByLabelText("Test Label");

  fireEvent.change(inputNode, { target: { value: "test" } });

  expect(handleChange).toHaveBeenCalledTimes(1);
  expect((inputNode as HTMLInputElement).value).toBe("test");
});
