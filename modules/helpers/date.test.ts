import { getContiguousDateIntervals } from "./date";
import { startOfDay } from "date-fns";

describe("getContiguousDateIntervals", () => {
  it("Single day interval", () => {
    const result = getContiguousDateIntervals(
      startOfDay(new Date("12/18/2019")),
      startOfDay(new Date("12/18/2019"))
    );
    expect(result).toStrictEqual([
      {
        start: startOfDay(new Date("12/18/2019")),
        end: startOfDay(new Date("12/18/2019")),
      },
    ]);
  });

  it("Multiple day contiguous interval", () => {
    const result = getContiguousDateIntervals(
      startOfDay(new Date("12/18/2019")),
      startOfDay(new Date("12/22/2019"))
    );
    expect(result).toStrictEqual([
      {
        start: startOfDay(new Date("12/18/2019")),
        end: startOfDay(new Date("12/22/2019")),
      },
    ]);
  });

  it("Multiple day non-contiguous intervals", () => {
    const result = getContiguousDateIntervals(
      startOfDay(new Date("12/18/2019")),
      startOfDay(new Date("1/5/2020")),
      [
        startOfDay(new Date("12/22/2019")),
        startOfDay(new Date("12/27/2019")),
        startOfDay(new Date("1/4/2020")),
      ]
    );
    expect(result).toStrictEqual([
      {
        start: startOfDay(new Date("12/18/2019")),
        end: startOfDay(new Date("12/21/2019")),
      },
      {
        start: startOfDay(new Date("12/23/2019")),
        end: startOfDay(new Date("12/26/2019")),
      },
      {
        start: startOfDay(new Date("12/28/2019")),
        end: startOfDay(new Date("1/3/2020")),
      },
      {
        start: startOfDay(new Date("1/5/2020")),
        end: startOfDay(new Date("1/5/2020")),
      },
    ]);
  });
});
