import { getAbsenceDateRangeDisplayText } from "./date-helpers";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { startOfDay } from "date-fns";

describe("getAbsenceDateRangeDisplayText", () => {
  it("Display single date", () => {
    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("12/18/2019")),
      startOfDay(new Date("12/18/2019"))
    );
    expect(result).toBe("December 18, 2019");
  });

  it("Display multiple contiguous dates within a single month", () => {
    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("12/16/2019")),
      startOfDay(new Date("12/20/2019"))
    );
    expect(result).toBe("December 16-20, 2019");
  });

  it("Display multiple non-contiguous dates within a single month", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/18/2019")), type: "absence" },
      { date: startOfDay(new Date("12/21/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/22/2019")), type: "nonWorkDay" },
    ];

    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("12/16/2019")),
      startOfDay(new Date("12/23/2019")),
      disabledDates
    );
    expect(result).toBe("December 16-17,19-20,23, 2019");
  });

  it("Display multiple non-contiguous dates within a single month (overly complex scenario)", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/20/2019")), type: "absence" },
      { date: startOfDay(new Date("11/22/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("11/27/2019")), type: "absence" },
      { date: startOfDay(new Date("11/28/2019")), type: "nonWorkDay" },
    ];

    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("11/18/2019")),
      startOfDay(new Date("11/29/2019")),
      disabledDates
    );
    expect(result).toBe("November 18-19,21,23-26,29, 2019");
  });

  it("Display multiple contiguous dates across months", () => {
    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("11/28/2019")),
      startOfDay(new Date("12/3/2019"))
    );
    expect(result).toBe("November 28 - December 3, 2019");
  });

  it("Display multiple non-contiguous dates across months", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/29/2019")), type: "absence" },
    ];

    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("11/28/2019")),
      startOfDay(new Date("12/3/2019")),
      disabledDates
    );
    expect(result).toBe("November 28,30 - December 3, 2019");
  });

  it("Display multiple non-contiguous dates across months (overly complex scenario)", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/20/2019")), type: "absence" },
      { date: startOfDay(new Date("11/22/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("11/27/2019")), type: "absence" },
      { date: startOfDay(new Date("11/28/2019")), type: "absence" },
      { date: startOfDay(new Date("12/3/2019")), type: "absence" },
      { date: startOfDay(new Date("12/6/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/10/2019")), type: "absence" },
    ];

    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("11/18/2019")),
      startOfDay(new Date("12/12/2019")),
      disabledDates
    );
    expect(result).toBe(
      "November 18-19,21,23-26,29 - December 2,4-5,7-9,11-12, 2019"
    );
  });

  it("Display multiple contiguous dates across years", () => {
    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("12/23/2019")),
      startOfDay(new Date("1/6/2020"))
    );
    expect(result).toBe("December 23, 2019 - January 6, 2020");
  });

  it("Display multiple non-contiguous dates across years", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/25/2019")), type: "absence" },
      { date: startOfDay(new Date("12/27/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("1/2/2020")), type: "absence" },
    ];

    const result = getAbsenceDateRangeDisplayText(
      startOfDay(new Date("12/23/2019")),
      startOfDay(new Date("1/6/2020")),
      disabledDates
    );
    expect(result).toBe("December 23-24,26,28, 2019 - January 1,3-6, 2020");
  });
});
