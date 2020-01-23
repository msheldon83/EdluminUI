import {
  getAbsenceDateRangeDisplayText,
  getAbsenceDateRangeDisplayTextWithDayOfWeek,
} from "./date-helpers";
import { DisabledDate } from "helpers/absence/computeDisabledDates";
import { startOfDay, eachDayOfInterval } from "date-fns";

describe("getAbsenceDateRangeDisplayText", () => {
  it("Display single date", () => {
    const result = getAbsenceDateRangeDisplayText([
      startOfDay(new Date("12/18/2019")),
      startOfDay(new Date("12/18/2019")),
    ]);
    expect(result).toBe("December 18, 2019");
  });

  it("Display multiple contiguous dates within a single month", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/16/2019")),
      end: startOfDay(new Date("12/20/2019")),
    });
    const result = getAbsenceDateRangeDisplayText(allDays);
    expect(result).toBe("December 16-20, 2019");
  });

  it("Display multiple non-contiguous dates within a single month", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/18/2019")), type: "absence" },
      { date: startOfDay(new Date("12/21/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/22/2019")), type: "nonWorkDay" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/16/2019")),
      end: startOfDay(new Date("12/23/2019")),
    });

    const result = getAbsenceDateRangeDisplayText(allDays, disabledDates);
    expect(result).toBe("December 16-17,19-20,23, 2019");
  });

  it("Display multiple non-contiguous dates within a single month (no disabled dates)", () => {
    const allDays = [
      startOfDay(new Date("12/16/2019")),
      startOfDay(new Date("12/17/2019")),
      startOfDay(new Date("12/19/2019")),
    ];

    const result = getAbsenceDateRangeDisplayText(allDays);
    expect(result).toBe("December 16-17,19, 2019");
  });

  it("Display multiple non-contiguous dates within a single month (overly complex scenario)", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/20/2019")), type: "absence" },
      { date: startOfDay(new Date("11/22/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("11/27/2019")), type: "absence" },
      { date: startOfDay(new Date("11/28/2019")), type: "nonWorkDay" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/18/2019")),
      end: startOfDay(new Date("11/29/2019")),
    });

    const result = getAbsenceDateRangeDisplayText(allDays, disabledDates);
    expect(result).toBe("November 18-19,21,23-26,29, 2019");
  });

  it("Display multiple contiguous dates across months", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/28/2019")),
      end: startOfDay(new Date("12/3/2019")),
    });
    const result = getAbsenceDateRangeDisplayText(allDays);
    expect(result).toBe("November 28 - December 3, 2019");
  });

  it("Display multiple non-contiguous dates across months", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/29/2019")), type: "absence" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/28/2019")),
      end: startOfDay(new Date("12/3/2019")),
    });

    const result = getAbsenceDateRangeDisplayText(allDays, disabledDates);
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
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/18/2019")),
      end: startOfDay(new Date("12/12/2019")),
    });

    const result = getAbsenceDateRangeDisplayText(allDays, disabledDates);
    expect(result).toBe(
      "November 18-19,21,23-26,29 - December 2,4-5,7-9,11-12, 2019"
    );
  });

  it("Display multiple contiguous dates across years", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/23/2019")),
      end: startOfDay(new Date("1/6/2020")),
    });
    const result = getAbsenceDateRangeDisplayText(allDays);
    expect(result).toBe("December 23, 2019 - January 6, 2020");
  });

  it("Display multiple contiguous dates across years within the same week", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/31/2019")),
      end: startOfDay(new Date("1/1/2020")),
    });
    const result = getAbsenceDateRangeDisplayText(allDays);
    expect(result).toBe("December 31, 2019 - January 1, 2020");
  });

  it("Display multiple non-contiguous dates across years", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/25/2019")), type: "absence" },
      { date: startOfDay(new Date("12/27/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("1/2/2020")), type: "absence" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/23/2019")),
      end: startOfDay(new Date("1/6/2020")),
    });

    const result = getAbsenceDateRangeDisplayText(allDays, disabledDates);
    expect(result).toBe("December 23-24,26,28, 2019 - January 1,3-6, 2020");
  });

  it("Display multiple non-contiguous single day dates that cross years", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/24/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/25/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/26/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/27/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/28/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/29/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/30/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/31/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("1/2/2020")), type: "nonWorkDay" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/23/2019")),
      end: startOfDay(new Date("1/3/2020")),
    });

    const result = getAbsenceDateRangeDisplayText(allDays, disabledDates);
    expect(result).toBe("December 23, 2019 - January 1,3, 2020");
  });
});

describe("getAbsenceDateRangeDisplayTextWithDayOfWeek", () => {
  it("Display single date", () => {
    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek([
      startOfDay(new Date("12/18/2019")),
      startOfDay(new Date("12/18/2019")),
    ]);
    expect(result).toBe("Wed, Dec 18");
  });

  it("Display multiple contiguous dates within a single month", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/16/2019")),
      end: startOfDay(new Date("12/20/2019")),
    });
    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(allDays);
    expect(result).toBe("Mon-Fri, Dec 16-20");
  });

  it("Display multiple non-contiguous dates within a single month", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/18/2019")), type: "absence" },
      { date: startOfDay(new Date("12/21/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/22/2019")), type: "nonWorkDay" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/16/2019")),
      end: startOfDay(new Date("12/23/2019")),
    });

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(
      allDays,
      disabledDates
    );
    expect(result).toBe("Mon-Tue,Thu-Fri,Mon, Dec 16-17,19-20,23");
  });

  it("Display multiple non-contiguous dates within a single month (no disabled dates)", () => {
    const allDays = [
      startOfDay(new Date("12/16/2019")),
      startOfDay(new Date("12/17/2019")),
      startOfDay(new Date("12/19/2019")),
    ];

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(allDays);
    expect(result).toBe("Mon-Tue,Thu, Dec 16-17,19");
  });

  it("Display multiple non-contiguous dates within a single month (overly complex scenario)", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/20/2019")), type: "absence" },
      { date: startOfDay(new Date("11/22/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("11/27/2019")), type: "absence" },
      { date: startOfDay(new Date("11/28/2019")), type: "nonWorkDay" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/18/2019")),
      end: startOfDay(new Date("11/29/2019")),
    });

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(
      allDays,
      disabledDates
    );
    expect(result).toBe("Mon-Tue,Thu,Sat-Tue,Fri, Nov 18-19,21,23-26,29");
  });

  it("Display multiple contiguous dates across months", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/28/2019")),
      end: startOfDay(new Date("12/3/2019")),
    });
    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(allDays);
    expect(result).toBe("Thu-Tue, Nov 28 - Dec 3");
  });

  it("Display multiple non-contiguous dates across months", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("11/29/2019")), type: "absence" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/28/2019")),
      end: startOfDay(new Date("12/3/2019")),
    });

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(
      allDays,
      disabledDates
    );
    expect(result).toBe("Thu,Sat-Tue, Nov 28,30 - Dec 3");
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
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("11/18/2019")),
      end: startOfDay(new Date("12/12/2019")),
    });

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(
      allDays,
      disabledDates
    );
    expect(result).toBe(
      "Mon-Tue,Thu,Sat-Tue,Fri-Mon,Wed-Thu,Sat-Mon,Wed-Thu, Nov 18-19,21,23-26,29 - Dec 2,4-5,7-9,11-12"
    );
  });

  it("Display multiple contiguous dates across years", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/23/2019")),
      end: startOfDay(new Date("1/6/2020")),
    });
    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(allDays);
    expect(result).toBe("Mon-Mon, Dec 23 - Jan 6");
  });

  it("Display multiple contiguous dates across years within the same week", () => {
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/31/2019")),
      end: startOfDay(new Date("1/1/2020")),
    });
    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(allDays);
    expect(result).toBe("Tue-Wed, Dec 31 - Jan 1");
  });

  it("Display multiple non-contiguous dates across years", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/25/2019")), type: "absence" },
      { date: startOfDay(new Date("12/27/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("1/2/2020")), type: "absence" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/23/2019")),
      end: startOfDay(new Date("1/6/2020")),
    });

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(
      allDays,
      disabledDates
    );
    expect(result).toBe(
      "Mon-Tue,Thu,Sat-Wed,Fri-Mon, Dec 23-24,26,28 - Jan 1,3-6"
    );
  });

  it("Display multiple non-contiguous single day dates that cross years", () => {
    const disabledDates: DisabledDate[] = [
      { date: startOfDay(new Date("12/24/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/25/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/26/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/27/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/28/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/29/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/30/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("12/31/2019")), type: "nonWorkDay" },
      { date: startOfDay(new Date("1/2/2020")), type: "nonWorkDay" },
    ];
    const allDays = eachDayOfInterval({
      start: startOfDay(new Date("12/23/2019")),
      end: startOfDay(new Date("1/3/2020")),
    });

    const result = getAbsenceDateRangeDisplayTextWithDayOfWeek(
      allDays,
      disabledDates
    );
    expect(result).toBe("Mon,Wed,Fri, Dec 23, Jan 1,3");
  });
});
