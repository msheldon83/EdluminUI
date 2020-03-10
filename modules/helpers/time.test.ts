import {
  secondsSinceMidnight,
  secondsAppliedToToday,
  secondsToFormattedHourMinuteString,
} from "./time";

describe("secondsSinceMidnight", () => {
  it("Normal Day in milliseconds (AM)", () => {
    const result = secondsSinceMidnight(1583843400000);
    expect(result).toEqual(30600);
  });

  it("Normal Day in date time string (AM)", () => {
    const result = secondsSinceMidnight("2020-03-10T08:00:00.000");
    expect(result).toEqual(28800);
  });

  it("Normal Day in milliseconds (PM)", () => {
    const result = secondsSinceMidnight(1593630900000);
    expect(result).toEqual(54900);
  });

  it("Normal Day in date time string (PM)", () => {
    const result = secondsSinceMidnight("2020-03-10T20:45:00.000");
    expect(result).toEqual(74700);
  });

  it("DST Begin Day in milliseconds (AM)", () => {
    const result = secondsSinceMidnight(1583668800000);
    expect(result).toEqual(28800);
  });

  it("DST Begin Day in date time string (AM)", () => {
    const result = secondsSinceMidnight("2020-03-08T08:00:00.000");
    expect(result).toEqual(28800);
  });

  it("DST Begin Day in milliseconds (PM)", () => {
    const result = secondsSinceMidnight(1583676900000);
    expect(result).toEqual(36900);
  });

  it("DST Begin Day in date time string (PM)", () => {
    const result = secondsSinceMidnight("2020-03-08T19:55:00.000");
    expect(result).toEqual(71700);
  });

  it("DST End Day in milliseconds (AM)", () => {
    const result = secondsSinceMidnight(1604241000000);
    expect(result).toEqual(34200);
  });

  it("DST End Day in date time string (AM)", () => {
    const result = secondsSinceMidnight("2020-11-01T08:00:00.000");
    expect(result).toEqual(28800);
  });

  it("DST End Day in milliseconds (PM)", () => {
    const result = secondsSinceMidnight(1604254500000);
    expect(result).toEqual(47700);
  });

  it("DST End Day in date time string (PM)", () => {
    const result = secondsSinceMidnight("2020-11-01T19:55:00.000");
    expect(result).toEqual(71700);
  });
});

describe("secondsAppliedToToday", () => {
  it("Seconds in AM Applied to current date", () => {
    const expectedDateTime = new Date();
    expectedDateTime.setHours(8, 0, 0, 0);

    const result = secondsAppliedToToday(28800);
    expect(result).toEqual(expectedDateTime);
  });

  it("Seconds in PM Applied to current date", () => {
    const expectedDateTime = new Date();
    expectedDateTime.setHours(19, 55, 0, 0);

    const result = secondsAppliedToToday(71700);
    expect(result).toEqual(expectedDateTime);
  });

  it("DST Start Day AM - seconds still approprately set", () => {
    const dstStartDate = new Date(2020, 2, 8, 0, 0, 0, 0);
    const expectedDateTime = new Date(2020, 2, 8, 8, 0, 0, 0);
    const result = secondsAppliedToToday(28800, dstStartDate);
    expect(result).toEqual(expectedDateTime);
  });

  it("DST Start Day PM - seconds still appropriately set", () => {
    const dstStartDate = new Date(2020, 2, 8, 0, 0, 0, 0);
    const expectedDateTime = new Date(2020, 2, 8, 19, 55, 0, 0);
    const result = secondsAppliedToToday(71700, dstStartDate);
    expect(result).toEqual(expectedDateTime);
  });

  it("DST End Day AM - seconds still approprately set", () => {
    const dstStartDate = new Date(2020, 10, 1, 0, 0, 0, 0);
    const expectedDateTime = new Date(2020, 10, 1, 9, 15, 0, 0);
    const result = secondsAppliedToToday(33300, dstStartDate);
    expect(result).toEqual(expectedDateTime);
  });

  it("DST End Day PM - seconds still appropriately set", () => {
    const dstStartDate = new Date(2020, 10, 1, 0, 0, 0, 0);
    const expectedDateTime = new Date(2020, 10, 1, 20, 45, 0, 0);
    const result = secondsAppliedToToday(74700, dstStartDate);
    expect(result).toEqual(expectedDateTime);
  });
});

describe("secondsToFormattedHourMinuteString", () => {
  it("Seconds formatted as 'h:mm a' in AM", () => {
    const result = secondsToFormattedHourMinuteString(28800);
    expect(result).toEqual("8:00 AM");
  });

  it("Seconds formatted as 'h:mm a' in PM", () => {
    const result = secondsToFormattedHourMinuteString(71700);
    expect(result).toEqual("7:55 PM");
  });
});
