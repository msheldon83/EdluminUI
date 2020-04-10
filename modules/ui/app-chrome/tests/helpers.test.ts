import { formatPhoneNumber } from "../helpers/index";

describe("formatPhoneNumber", () => {
  it("Basic Phone Number", () => {
    const phoneNumber = "1234567890";
    const result = formatPhoneNumber(phoneNumber);

    expect(result).toStrictEqual("(123) 456-7890");
  });

  it("Not a phone number", () => {
    const phoneNumber = "ABC";
    const result = formatPhoneNumber(phoneNumber);

    expect(result).toStrictEqual("");
  });

  it("Not a phone number", () => {
    const phoneNumber = "123456";
    const result = formatPhoneNumber(phoneNumber);

    expect(result).toStrictEqual("");
  });
});
